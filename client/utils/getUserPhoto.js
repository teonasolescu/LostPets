if (localStorage.getItem("token") !== null) {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:6969/users?user=${token}`)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                const {
                    user
                } = response;

                document.getElementById("avatar").src = user.profilePhoto;
            } else {
                alert(response.message);
            }
        })
        .catch(e => {
            console.log(e);
        });
}
