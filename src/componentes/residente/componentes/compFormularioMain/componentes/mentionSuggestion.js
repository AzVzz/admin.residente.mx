import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import MentionList from './MentionList.jsx';

const createSuggestion = (restaurantesRef) => ({
  char: '@',
  items: ({ query }) => {
    const restaurantes = restaurantesRef.current || [];
    if (!query) return restaurantes.slice(0, 10);
    return restaurantes
      .filter((r) =>
        r.nombre_restaurante?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10);
  },
  render: () => {
    let reactRenderer;
    let popup;

    return {
      onStart: (props) => {
        if (!props.clientRect) return;

        reactRenderer = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: reactRenderer.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props) {
        reactRenderer?.updateProps(props);

        if (!props.clientRect) return;
        popup?.[0]?.setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup?.[0]?.hide();
          return true;
        }
        return reactRenderer?.ref?.onKeyDown(props);
      },

      onExit() {
        popup?.[0]?.destroy();
        reactRenderer?.destroy();
      },
    };
  },
});

export default createSuggestion;
