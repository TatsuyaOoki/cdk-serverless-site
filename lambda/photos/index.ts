export const handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        id: "1",
        title: "猫",
        imageUrl: "https://picsum.photos/300",
      },
      {
        id: "2",
        title: "犬",
        imageUrl: "https://picsum.photos/301",
      },
    ]),
  };
};
