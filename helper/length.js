module.exports = function (list) {
  const params = [].slice.call(arguments);
  params.shift();
  params.pop();

  return list.length;
};
