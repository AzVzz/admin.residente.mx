import { useFormContext, Controller } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

const Contenido = () => {
    const { control, setValue, watch, formState: { errors } } = useFormContext();
    const contenidoValue = watch('contenido');

    const editor = useEditor({
        extensions: [StarterKit.configure({
            // Configurar para preservar mejor los espacios
            paragraph: {
                HTMLAttributes: {
                    style: 'white-space: pre-wrap;'
                }
            }
        })],
        content: contenidoValue || '',
        onUpdate: ({ editor }) => {
            // Preservar saltos de línea y espacios múltiples
            let html = editor.getHTML();
            // Convertir saltos de línea a <br> para mejor preservación
            html = html.replace(/\n/g, '<br>');
            setValue('contenido', html);
        },
    });

    useEffect(() => {
        if (editor && contenidoValue !== editor.getHTML()) {
            editor.commands.setContent(contenidoValue || '');
        }
    }, [contenidoValue, editor]);

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
                        <div className="flex gap-2 mb-2">
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
                        </div>
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