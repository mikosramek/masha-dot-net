const convertToNice = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
};

module.exports = {
  convertToNice,
};
