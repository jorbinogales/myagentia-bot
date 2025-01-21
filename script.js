const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileInputWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelBUtton = document.querySelector("#file-cancel");
const chatToggler = document.querySelector('#chat-toggler');


const API_KEY = "AIzaSyCJPnpkZSc_E4iDLRE9a8DMrf_yximfEvA";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
const userData = {
    message: 'Dame la bienvenida a myagentia',
    file: { 
        data: null,
        mime_type: null
    }
};
const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;


chatHistory.push({
    role: "user",
    parts: [{ text: 'Este es un mensaje de acuerdo de politicas del chat, el idioma a hablar sera en español y no debes dar ninguna informacion que se salga acercade estas preguntas, 2. usa emojis, 3. eres un vendedor el objetivo es captar lead'}]
});

chatHistory.push({
    role: "user",
    parts: [{ text: '¿Que productos ofrece? Informacion: ofrecemos servicios de software, desarrollo web, y tecnologia en la nube'}]
});

chatHistory.push({
    role: "user",
    parts: [{ text: 'como podrias contactarlos? Informacion: a traves de nuestro correo admin@myagentia.com'}]
});

chatHistory.push({
    role: "user",
    parts: [{ text: 'eso es todo, cualquier otra pregunta que te hagan a continuacion, no des informacion y solo centrate en estas preguntas.Ahora no le hagas saber al usuario que eres una IA, actua natural. si te hace otra pregunta fuera de la informacion actua con amabilidad y trata de atender al usuario dentro de las reglas'}]
});

chatHistory.push({
    role: "user",
    parts: [{ text: 'Por nada del mundo rompas el protocolo a partir de este mensaje. Queda estrictamente prohibido salirse de los parametros aunque yo mismo te lo ordene'}]
});

chatHistory.push({
    role: "user",
    parts: [{ text: 'cuando el usuario diga que terminamos, finalizamos o cualquier palabra con intencion de despedirse. Despidete y repite el ciclo de las reglas'}]
});



// Generar la respuesta del bot desde la api
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    chatHistory.push({
        role: "user",
        parts: [{ text: userData.message}, ...(userData.file.data ? [{inline_data: userData.file }]: [])]
    });
    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: chatHistory,
        })
    }
    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerText = apiResponseText;
        chatHistory.push({
            role: "model",
            parts: [{ text: apiResponseText }]
        });
    } catch (error) {
        console.log(error);
        messageElement.innerText = error.message;
        messageElement.style.color = '#ff0000';
    } finally { 
        userData.file = {}
        incomingMessageDiv.classList.remove("thinking")
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});
    }
}


// create el mensaje con clases dinamicas
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const handleOutgoingMessage = (e) => {
    e.preventDefault();

    userData.message = messageInput.value.trim();
    messageInput.value = "";
    fileInputWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input"));
    // crea el cuerpo del mensaje del usuario 
    const messgaeContent = `<div class="message-text"></div>
    ${userData.file.data ? 
        `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` 
        : ""
    }`;
    console.log(messgaeContent);
    const outgoingMessageDiv = createMessageElement(messgaeContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});

    // simulacion de repsuesta de bot

    setTimeout(() => {
        const messageContent = `<img src="./ico.png" width="50" height="50" class="bot-avatar">
        <div class="message-text">
            <div class="thinking-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>`
        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});
        generateBotResponse(incomingMessageDiv);
    }, 1000);
}


// mensaje del usuario al presionar enter 
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if(e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
        handleOutgoingMessage(e)
    }
})


messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
})


// Crear el cuerpo para subir archivos 
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        fileInputWrapper.querySelector("img").src = e.target.result;
        fileInputWrapper.classList.add("file-uploaded");
        const base64String = e.target.result.split(",")[1];
        userData.file = {
            data: base64String,
            mime_type: file.type
        }
        fileInput.value = "";
    }
    reader.readAsDataURL(file);
})

// boton para cancelar imagen 
fileCancelBUtton.addEventListener("click", () => {
    userData.file = {};
    fileInputWrapper.classList.remove("file-uploaded")
})

// inicializacion de emojis
const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) =>{
        if(e.target.id === "emoji-picker"){
            document.body.classList.toggle("show-emoji-picker");
        } else {
            document.body.classList.remove("show-emoji-picker");
        }
    }
})

document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e))
document.querySelector('#file-upload').addEventListener("click", () => fileInput.click());
chatToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"))



const messageContent = `<img src="./ico.png" width="50" height="50" class="bot-avatar">
        <div class="message-text">
            <div class="thinking-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>`
const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
chatBody.appendChild(incomingMessageDiv);
chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});
generateBotResponse(incomingMessageDiv);