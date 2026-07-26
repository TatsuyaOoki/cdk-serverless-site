const button = document.getElementById("btn");
const result = document.getElementById("result");
const uploadButton = document.getElementById("uploadBtn");
const fileInput = document.getElementById("file");

uploadButton.addEventListener("click", async () => {
    const file = fileInput.files[0];

    if (!file) {
        alert("ファイルを選択してください");
        return;
    }

    console.log(file);

    const response = await fetch(
        "/api/photos/upload-url",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fileName: file.name,
                contentType: file.type,
            }),
        },
    );

    const { uploadUrl, imageUrl, key } = await response.json();

    const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Type": file.type,
        },
        body: file,
    });

    if (!uploadResponse.ok) {
        alert("アップロードに失敗しました");
        return;
    }

    console.log("アップロード成功");
    console.log(imageUrl);

    const registerResponse = await fetch(
        "/api/photos/register-db",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fileName: file.name,
                key,
            }),
        },
    );
    if (!registerResponse.ok) {
        alert("DB登録に失敗しました");
        return;
    }
    console.log("DynamoDB登録完了");
});

button.addEventListener("click", async () => {
    const response = await fetch("/api/photos");

    const photos = await response.json();

    result.innerHTML = "";

    const imageBaseUrl = window.location.origin;
    for (const photo of photos) {
    const card = document.createElement("div");

    card.innerHTML = `
        <h3>${photo.title}</h3>
        <img src="${imageBaseUrl}/${photo.key}" width="200">
    `;

    result.appendChild(card);
    }
});