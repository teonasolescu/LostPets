document.getElementById("logout").onclick = () => {
    localStorage.clear();
    window.location.href = "/client/landing/landing.html";
}