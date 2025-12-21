export default function () {
  const isIos = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);
  return isIos;
}
