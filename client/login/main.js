window.onload = () => {
    document.getElementById("form").onsubmit = e => {
        e.preventDefault();

        if (
            document.getElementById("email").value &&
            document.getElementById("psw").value
        ) {
            const body = {
                email: document.getElementById("email").value,
                password: CryptoJS.SHA1(
                    document.getElementById("psw").value
                ).toString()
            };

            fetch("http://127.0.0.1:6969/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*"
                },
                body: JSON.stringify(body)
            })
                .then(response => response.json())
                .then(response => {
                    if (response.success) {
                        localStorage.setItem("token", response.token);
                        window.location.href = "/client/home/home.html";
                    } else {
                        alert(response.message);
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        } else {
            alert("Yuo need to fill the fields.");
        }
    };
};
