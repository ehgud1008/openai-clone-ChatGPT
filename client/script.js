import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
    element.textContent = '';

    loadInterval = setInterval( () => {
        element.textContent += '.';

        if(element.textContent === '....'){
            element.textContent = '';
        }
    }, 300);
}

function typeText (element, text){
    let index = 0;
    
    let interval = setinterval( () => {
        if(index < text.length){
            element.innerHTML += text.charAt(index);
            index ++;
        }else{
            clearInterval(interval);
        }
    }, 20);
}

function gernerateUniqueId (){
    const timestamp = Date.now();
    const random = Math.random();
    const hexaString = random.toString(16);

    return `id-${timestamp}-${hexaString}`;
}

function chatStripe (isAi, value, uniqueId){
    return `
        <div class = "wrap ${isAi && 'ai'}">
            <div class = "chat">
                <div className="profile">
                    <img src = "${isAi ? bot : user}"
                        alt = "${isAi ? 'bot' : 'user' }"
                    />
                </div>
                <div class = "message" id = "${uniqueId}">${value}</div>
            </div>
        </div>
    `
}

const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    
    //user ChatStripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

    form.reset();

    //bot ChatStripe
    const uniqueId = gernerateUniqueId(); 
    chatContainer.innerHTML += chatStripe(true, "", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);

    loader(messageDiv);
    var options = {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body : JSON.stringify({
                prompt: data.get('prompt')
            })
        }
    const response = await fetch('http://localhost:5000', options);

    clearInterval(loadInterval);
    messageDiv.innerHTML = "";
    
    if(response.ok){
        const data = await response.json();
        const parsedData = data.bot.trim();

        typeText(messageDiv, parsedData);
    }else{
        const error = await response.text();
        messageDiv.innerHTML = "Something went wrong";
        alert(error);
    }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
        handleSubmit();
    }
})