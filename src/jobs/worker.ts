import {processPending} from './process';const loop=async()=>{await processPending();setTimeout(loop,3000)};void loop();
