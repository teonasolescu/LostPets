window.onload = () => {
    document.getElementById("form").onsubmit = e => {
        e.preventDefault();

        if (
            document.getElementById("fname").value &&
            document.getElementById("lname").value &&
            document.getElementById("email").value &&
            document.getElementById("telnr").value &&
            document.getElementById("psw").value &&
            document.getElementById("pswc").value &&
            document.getElementById("psw").value ===
                document.getElementById("pswc").value
        ) {
            if (document.getElementById("check").checked) {
                const body = {
                    firstname: document.getElementById("fname").value,
                    lastname: document.getElementById("lname").value,
                    email: document.getElementById("email").value,
                    phone: document.getElementById("telnr").value,
                    password: CryptoJS.SHA1(
                        document.getElementById("psw").value
                    ).toString()
                };

                fetch("http://127.0.0.1:6969/users/register", {
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
                alert("You must be agree with our terms.");
            }
        } else {
            alert("Passwords doesn't match.");
        }
    };
};
