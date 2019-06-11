window.onload = () => {
    const token = localStorage.getItem("token");

    document.getElementById("announcement").onclick = () => {
        const name = document.getElementById("name").value;
        const gender = document.getElementById("gender").value;
        const height = document.getElementById("height").value;
        const breed = document.getElementById("breed").value;
        const color = document.getElementById("color").value;
        const collar = document.getElementById("collar").value;
        const age = document.getElementById("age").value;
        const about = document.getElementById("about").value;

        const file = document.getElementById('image').files[0];
        const formData = new FormData();
        formData.append('file', file);

        if (name && gender && height && breed && color && collar && age && about && file) {
            const body = {
                name,
                gender,
                height,
                breed,
                color,
                collar,
                age: parseInt(age),
                about
            }

            fetch(`http://127.0.0.1:6969/users/pet?user=${token}`, {
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
                        fetch(`http://127.0.0.1:6969/users/pet?pet=${response.petId}`, {
                                method: 'POST',
                                body: formData
                            })
                            .then((response) => response.json())
                            .then(response => {
                                if (!response.success) {
                                    alert("Something got wrong!");
                                } else {
                                    window.location.href = "/client/home/home.html";
                                }
                            })
                    }
                })
                .catch(() => {
                    alert("Something got wrong!");
                });
        } else {
            alert("All fields are required");
        }
    }
}