window.onload = () => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:6969/users?user=${token}`)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                const { user } = response;

                document.getElementById("myName").innerHTML = `${user.lastname} ${user.firstname}`;
                document.getElementById("myPhoto").src = user.profilePhoto;
                document.getElementById("myEmail").innerHTML = user.email;
                document.getElementById("myNumber").innerHTML = user.phone;

                if (user.nrFounds > 1) {
                    document.getElementById("lev1").style.display = "unset";
                }

                if (user.nrFounds > 5) {
                    document.getElementById("lev2").style.display = "unset";
                }

                if (user.nrFounds > 10) {
                    document.getElementById("lev3").style.display = "unset";
                }
            } else {
                alert(response.message);
            }
        })
        .catch(e => {
            console.log(e);
        });
};
