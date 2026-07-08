const button = document.getElementById("btn");
const result = document.getElementById("result");
button.addEventListener("click", async () => {
    const response = await fetch("<APIGW>/photos");

    const photos = await response.json();

    result.innerHTML = "";

    for (const photo of photos) {
    const card = document.createElement("div");

    card.innerHTML = `
        <h3>${photo.title}</h3>
        <img src="${photo.imageUrl}" width="200">
    `;

    result.appendChild(card);
    }
});