import { int } from '@/lib/math';
import { Content as Content } from './content';

const { useState, useEffect } = React;

const DEFAULT_WORKER_FILE_PATH = './gradient.worker.js';

export const Widget = ({ config: given }) => {
  const [worker, setWorker] = useState();
  const [props, setProps] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!worker) {
      setWorker(
        new SharedWorker(given.worker_file_path || DEFAULT_WORKER_FILE_PATH)
      );
    }
  }, []);

  useEffect(() => {
    if (worker && worker.port) {
      worker.port.onmessage = (event = {}) => {
        const { data = {} } = event;
        const { action, payload } = data;
        console.log('(widget) [index] ++++ onmessage()');

        if (action && action === 'resize' && payload) {
          const { width, height } = payload;
          console.log(`(widget) [index] ${int(width)}x${int(height)}`);

          if (width && height) {
            setProps({ width, height });
          }
        }
      };
    }
  }, [worker]);

  return <Content {...props} />;
};
