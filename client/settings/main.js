window.onload = () => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:6969/users?user=${token}`)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                const {
                    user
                } = response;

                document.getElementById("fname").value = user.firstname;
                document.getElementById("lname").value = user.lastname;
                document.getElementById("email").value = user.email;
                document.getElementById("nr").value = user.phone;
            } else {
                alert(response.message);
            }
        })
        .catch(e => {
            console.log(e);
        });

    document.getElementById("form").onsubmit = e => {
        e.preventDefault();

        const body = {};

        if (document.getElementById("fname").value) {
            body.firstname = document.getElementById("fname").value;
        }

        if (document.getElementById("lname").value) {
            body.lastname = document.getElementById("lname").value;
        }

        if (document.getElementById("email").value) {
            body.email = document.getElementById("email").value;
        }

        if (document.getElementById("nr").value) {
            body.phone = document.getElementById("nr").value;
        }

        if (document.getElementById("psw").value) {
            if (
                document.getElementById("cpsw").value ===
                document.getElementById("psw").value
            ) {
                body.password = CryptoJS.SHA1(
                    document.getElementById("psw").value
                ).toString();
            } else {
                alert("Passwords must match.");
                return;
            }
        }

        document.getElementById("save").innerHTML = "Saving..";

        fetch(`http://127.0.0.1:6969/users/change?user=${token}`, {
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
                if (!response.success) {
                    alert(response.message);
                } else {
                    const file = document.getElementById('image').files[0];

                    if (file) {
                        const formData = new FormData();
                        formData.append('file', file);

                        fetch(`http://127.0.0.1:6969/users/image?user=${token}`, {
                                method: 'POST',
                                body: formData
                            })
                            .then((response) => response.json())
                            .then(response => {
                                if (!response.success) {
                                    alert("Something got wrong!");
                                } else {
                                    document.getElementById("save").innerHTML = "Save";
                                    document.getElementById("avatar").src = response.photo;
                                }
                            })
                    }
                }
            })
            .catch(() => {
                document.getElementById("save").innerHTML = "Save";
            });
    };
};