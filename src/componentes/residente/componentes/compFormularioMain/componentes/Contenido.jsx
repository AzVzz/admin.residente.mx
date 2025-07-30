import { useFormContext, Controller } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

const Contenido = () => {
    const { control, setValue, watch, formState: { errors } } = useFormContext();
    const contenidoValue = watch('contenido');

    const editor = useEditor({
        extensions: [StarterKit],
        content: contenidoValue || '',
        onUpdate: ({ editor }) => {
            setValue('contenido', editor.getHTML());
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
                                className={editor.isActive('bold') ? 'font-grotesk text-blue-600 font-bold border-1 w-8 rounded bg-gray-100' : 'font-roman rounded w-8 border-1'}
                            >
                                B
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                className={editor.isActive('bulletList') ? 'font-grotesk text-blue-600 font-bold' : 'font-roman'}
                            >
                                • Lista
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                className={editor.isActive('orderedList') ? 'font-grotesk text-blue-600 font-bold' : 'font-roman'}
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
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                className={editor.isActive('heading', { level: 2 }) ? 'font-grotesk text-blue-600 font-bold' : 'font-roman'}
                            >
                                H2
                            </button>
                        </div>
                        <EditorContent
                            editor={editor}
                            className="font-roman border-1"
                        />
                        {/* Custom styles for editor content */}
                        <style>{`
                            .ProseMirror {
                                font-family: var(--font-roman, Arial), sans-serif;
                                font-size: 1rem;
                            }
                            .ProseMirror strong {
                                font-family: var(--font-grotesk, Arial Black), sans-serif;
                                font-weight: bold;
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