import { createRoot } from 'react-dom/client';
import { RichTextFieldView } from '../../src/plugins/fields/rich-text/rich-text-field.view';
import { richTextFieldStates } from '../../src/plugins/fields/rich-text/rich-text-field.states';
import './index.css';

const only = new URLSearchParams(location.search).get('state');

const root = document.getElementById('root');
if (!root) throw new Error('rich-text-states.html is missing #root');
createRoot(root).render(
  <div className='mx-auto flex max-w-xl flex-col gap-8 p-4'>
    {richTextFieldStates
      .filter((state) => !only || state.name === only)
      .map((state) => (
        <section key={state.name} data-state={state.name}>
          <h2 className='mb-2 text-xs text-muted-foreground'>{state.name}</h2>
          <RichTextFieldView {...state.props} />
        </section>
      ))}
  </div>
);
