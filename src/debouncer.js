function debouncer(props){
  const { onStart = () => {}, onEnd = () => {}, timeout = 1000 } = props;
  let timer;
  return (...args) => {
    if (!timer) {
      onStart.apply(this, args);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      onEnd.apply(this, args);
    }, timeout);
  };
}

export default debouncer;