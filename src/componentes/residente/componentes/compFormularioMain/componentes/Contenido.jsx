import { useFormContext, Controller } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import { mergeAttributes } from '@tiptap/core';
import { useEffect, useRef, useState } from 'react';
import { imgApi, urlApi } from '../../../../api/url';
import { restaurantesBasicosGet } from '../../../../api/restaurantesBasicosGet';
import createSuggestion from './mentionSuggestion';

// Extend Mention to render as <a> links with restauranteId attribute
const RestauranteMention = Mention.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            restauranteId: {
                default: null,
                parseHTML: (element) => {
                    const val = element.getAttribute('data-restaurante-id');
                    return val ? parseInt(val) : null;
                },
                renderHTML: (attributes) => {
                    if (!attributes.restauranteId) return {};
                    return { 'data-restaurante-id': attributes.restauranteId };
                },
            },
        };
    },
    renderHTML({ node, HTMLAttributes }) {
        const slug = node.attrs.id;
        const label = node.attrs.label || slug;
        return [
            'a',
            mergeAttributes(
                { 'data-type': 'mention' },
                HTMLAttributes,
                {
                    href: `https://residente.mx/restaurantes/${slug}`,
                    class: 'mention-restaurante',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                }
            ),
            label,
        ];
    },
    parseHTML() {
        return [
            { tag: 'a[data-type="mention"]' },
            { tag: 'span[data-type="mention"]' },
        ];
    },
});

const Contenido = () => {
    const { control, setValue, getValues, watch, formState: { errors } } = useFormContext();
    const contenidoValue = watch('contenido');
    const fileInputRef = useRef(null);
    const restaurantesRef = useRef([]);

    // Fetch restaurantes for @ mentions
    useEffect(() => {
        restaurantesBasicosGet()
            .then((data) => {
                restaurantesRef.current = Array.isArray(data) ? data : [];
            })
            .catch(() => {
                restaurantesRef.current = [];
            });
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Configurar para preservar mejor los espacios
                paragraph: {
                    HTMLAttributes: {
                        style: 'white-space: pre-wrap;'
                    }
                }
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                protocols: ['http', 'https', 'mailto'],
                defaultProtocol: 'https',
                HTMLAttributes: {
                    class: 'editor-link',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            RestauranteMention.configure({
                HTMLAttributes: {
                    class: 'mention-restaurante',
                },
                suggestion: createSuggestion(restaurantesRef),
            }),
        ],
        content: contenidoValue || '',
        onUpdate: ({ editor }) => {
            // Preservar saltos de línea y espacios múltiples
            let html = editor.getHTML();
            // Convertir saltos de línea a <br> para mejor preservación
            html = html.replace(/\n/g, '<br>');
            setValue('contenido', html);

            // Extraer IDs numéricos de menciones y agregarlos a restaurantes_ids
            const mentionIds = [];
            editor.state.doc.descendants((node) => {
                if (node.type.name === 'mention' && node.attrs.restauranteId) {
                    mentionIds.push(node.attrs.restauranteId);
                }
            });
            if (mentionIds.length > 0) {
                const currentIds = getValues('restaurantes_ids') || [];
                const merged = [...new Set([...currentIds, ...mentionIds])];
                if (merged.length !== currentIds.length) {
                    setValue('restaurantes_ids', merged, { shouldDirty: true });
                }
            }
        },
    });

    useEffect(() => {
        if (editor && contenidoValue !== editor.getHTML()) {
            editor.commands.setContent(contenidoValue || '');
        }
    }, [contenidoValue, editor]);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
            event.target.value = '';
            return;
        }

        try {
            const formData = new FormData();
            formData.append('imagen', file);

            const endpoint = `${urlApi}api/uploads/editor-image`;
            const resp = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });
            const respClone = resp.clone();
            let data;
            try {
                data = await resp.json();
            } catch (e) {
                const txt = await respClone.text();
                throw new Error(`Respuesta no JSON (${resp.status}): ${txt}`);
            }
            if (!resp.ok || !data?.url) {
                throw new Error(data?.error || `Error subiendo imagen (${resp.status})`);
            }

            // Insertar imagen con src = URL y descripcion = URL
            editor
                .chain()
                .focus()
                .setImage({ src: data.url, alt: '', title: '', descripcion: data.url })
                .run();
        } catch (err) {
            console.error('Error al subir imagen:', err);
            alert(`No se pudo subir la imagen: ${err.message}`);
        } finally {
            // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
            event.target.value = '';
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleSetLink = () => {
        if (!editor) return;
        // Si ya tiene link, quitarlo
        if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
            return;
        }
        const input = window.prompt('URL del enlace (ej: https://residente.mx):');
        if (!input) return;
        // Agregar https:// si no tiene protocolo
        const url = /^https?:\/\//i.test(input) ? input : `https://${input}`;
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const handleDeleteImage = () => {
        if (!editor) return;
        // Si la selección actual es una imagen, eliminarla
        if (editor.isActive('image')) {
            editor.chain().focus().deleteSelection().run();
            return;
        }
        // Buscar una imagen cercana a la selección y eliminarla
        const { state } = editor;
        const { from, to } = state.selection;
        let removed = false;
        state.doc.nodesBetween(Math.max(0, from - 1), Math.min(state.doc.content.size, to + 1), (n, pos) => {
            if (!removed && n.type && n.type.name === 'image') {
                editor.chain().setTextSelection({ from: pos, to: pos + n.nodeSize }).deleteSelection().run();
                removed = true;
                return false; // detener iteración
            }
            return undefined;
        });
        if (!removed) alert('Selecciona la imagen para borrarla (haz clic sobre ella)');
    };

    return (
        <div className="space-y-2">
            <label htmlFor="contenido" className="block text-sm font-medium text-gray-700">
                Contenido
            </label>
            <Controller
                name="contenido"
                control={control}
                rules={{ required: 'El contenido es obligatorio' }}
                render={() => (
                    <div>
                        {/* Toolbar */}
                        <div className="flex gap-2 mb-2 flex-wrap items-center">
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                className={editor.isActive('bold') ? 'font-grotesk text-blue-600 font-bold border-1 w-8 rounded bg-gray-50' : 'font-roman rounded w-8 border-1'}
                            >
                                B
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                className={editor.isActive('bulletList') ? 'font-roman text-blue-600 w-15 border-1 rounded bg-gray-50' : 'font-roman rounded w-15 border-1'}
                            >
                                • Lista
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                className={editor.isActive('orderedList') ? 'font-roman text-blue-600 w-15 border-1 rounded bg-gray-50' : 'font-roman rounded w-15 border-1'}
                            >
                                1. Lista
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().setParagraph().run()}
                                className={editor.isActive('paragraph') ? 'font-grotesk text-blue-600 font-bold' : 'font-roman'}
                            >
                                P
                            </button>
                            <button
                                type="button"
                                onClick={triggerImageUpload}
                                className="font-roman text-blue-600 w-20 border-1 rounded bg-gray-50 hover:bg-gray-100"
                            >
                                 Imagen
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteImage}
                                className="font-roman text-red-600 w-28 border-1 rounded bg-gray-50 hover:bg-gray-100"
                            >
                                Borrar imagen
                            </button>
                            <button
                                type="button"
                                onClick={handleSetLink}
                                className={editor.isActive('link') ? 'font-roman text-blue-600 w-20 border-1 rounded bg-blue-50 hover:bg-blue-100' : 'font-roman text-blue-600 w-20 border-1 rounded bg-gray-50 hover:bg-gray-100'}
                            >
                                Enlace
                            </button>
                            <span className="text-xs text-gray-400 ml-2">
                                Escribe @ para mencionar un restaurante
                            </span>
                        </div>
                        {/* Input oculto para seleccionar imágenes */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                        <EditorContent
                            editor={editor}
                            className="font-roman border-1 rounded-md "
                        />
                        {/* Custom styles for editor content */}
                        <style>{`
                        .ProseMirror {
                            font-family: var(--font-roman, Arial), sans-serif;
                            font-size: 1rem;
                            min-height: 120px;
                            background: #fff;
                            padding: 12px;
                            border-radius: 8px;
                            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                        }
                        .ProseMirror ul,
                        .ProseMirror ol {
                            margin-left: 1.5em;
                            padding-left: 0;
                        }
                        .ProseMirror ul {
                            list-style-type: disc;
                        }
                        .ProseMirror ol {
                            list-style-type: decimal;
                        }
                        .ProseMirror .editor-image {
                            width: 100%;
                            height: auto;
                            border-radius: 8px;
                            margin: 8px 0;
                            display: block;
                        }
                        .ProseMirror .editor-image:hover {
                            cursor: pointer;
                            opacity: 0.9;
                        }
                        /* Mention styles in editor - underlined hyperlink */
                        .ProseMirror .mention-restaurante {
                            color: #2563eb;
                            text-decoration: underline;
                            cursor: pointer;
                        }
                        .ProseMirror .mention-restaurante:hover {
                            color: #1d4ed8;
                        }
                        /* Link styles in editor */
                        .ProseMirror .editor-link {
                            color: #2563eb;
                            text-decoration: underline;
                            cursor: pointer;
                        }
                        .ProseMirror .editor-link:hover {
                            color: #1d4ed8;
                        }
                        /* Mention dropdown styles */
                        .mention-dropdown {
                            background: white;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                            max-height: 200px;
                            overflow-y: auto;
                            min-width: 200px;
                        }
                        .mention-dropdown-item {
                            display: block;
                            width: 100%;
                            text-align: left;
                            padding: 6px 12px;
                            font-size: 13px;
                            border: none;
                            background: none;
                            cursor: pointer;
                            font-family: var(--font-roman, Arial), sans-serif;
                        }
                        .mention-dropdown-item:hover,
                        .mention-dropdown-item.is-selected {
                            background-color: #eff6ff;
                            color: #1e40af;
                        }
                        /* Tippy overrides for mention popup */
                        .tippy-box {
                            background: transparent !important;
                            border: none !important;
                            box-shadow: none !important;
                        }
                        .tippy-content {
                            padding: 0 !important;
                        }
                        `}</style>
                    </div>
                )}
            />
            {errors.contenido && (
                <p className="mt-1 text-sm text-red-600">{errors.contenido.message}</p>
            )}
        </div>
    );
};

export default Contenido;
