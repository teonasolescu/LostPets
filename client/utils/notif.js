let first = true;
const token = localStorage.getItem("token");

document.getElementById("notifBtn").onclick = () => {
    if (document.getElementById("notificationDrop").classList.contains("active")) {
        if (first) {
            document.getElementById("notifDot").classList.remove("active");
            first = false;
        }

        document.getElementById("notificationDrop").classList.remove("active");
    } else {
        if (first) {
            fetch(`http://127.0.0.1:6969/users/notifications-read?user=${token}`)
                .catch(e => {
                    console.log(e);
                });

            document.getElementById("notifDot").classList.remove("active");
            first = false;
        }

        document.getElementById("notificationDrop").classList.add("active");
    }
}

fetch(`http://127.0.0.1:6969/users/notifications?user=${token}`)
    .then(response => response.json())
    .then(response => {
        if (response.success) {
            const {
                notifications
            } = response;

            console.log(notifications);

            document.getElementById("notificationDrop").innerHTML = "";

            let unred = false;

            if (notifications.length > 0) {
                notifications.forEach(notif => {
                    if (!notif.seen) {
                        unred = true;
                    }

                    document.getElementById("notificationDrop").innerHTML += `
                        <div class="notifContainer">
                            <img src="${notif.user.profilePhoto}" alt="">
                            <p>${notif.message}</p>
                        </div>
                    `;
                });

                if (unread) {
                    document.getElementById("notifDot").classList.add("active");
                }
            } else {
                document.getElementById("notificationDrop").innerHTML = "No notifications.";
            }
        } else {
            alert(response.message);
        }
    })
    .catch(e => {
        console.log(e);
    });