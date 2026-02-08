function EmailTest(input) {
  // Regular expression for validating an email address
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  if (emailPattern.test(input)) {
    return 'email'; 
  } else {
    return 'username'; 
  }
}


document.getElementById("login-form").addEventListener('submit', async function(event) {
event.preventDefault();

const usrorem = document.getElementById("usrorem").value;
const password = document.getElementById("login-password").value;



const cred = btoa(`${usrorem}:${password}`)

const request = await fetch('https://learn.reboot01.com/api/auth/signin', {
    method: 'POST',
    headers: {
        'Authorization':  `Basic ${cred}`
    }
});



if (request.ok){
    const requestData = await request.json();
    // console.log(requestData.token)
    localStorage.setItem('JWT', requestData);
    window.location.href = './profile.html';
}else {
    document.getElementById('error-message').style.display = 'block';
}

});