if (localStorage.getItem("token") === null) {
    window.location.href = "/client/landing/landing.html";
} else {
    const expire = localStorage.getItem("expire");

    if (new Date().valueOf() > expire) {
        localStorage.clear();
        window.location.href = "/client/landing/landing.html";
    }
}
