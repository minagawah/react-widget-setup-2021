import { Widget } from './widget';

export const init = config => {
  ReactDOM.render(
    <Widget config={config} />,
    document.getElementById('gradient')
  );
};
