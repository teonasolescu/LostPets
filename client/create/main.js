window.onload = () => {
    const token = localStorage.getItem("token");
    let currentLatLng = [47.151726, 27.587914];
    const mymap = L.map('mapid').setView(currentLatLng, 16);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGVvZG9ycHJvY2EiLCJhIjoiY2p3cWRtMHl6MXphMDQ4cGppdXJyd3hvcyJ9.91T7GADbAQlx_rU4kJrFHQ', {
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoidGVvZG9ycHJvY2EiLCJhIjoiY2p3cWRtMHl6MXphMDQ4cGppdXJyd3hvcyJ9.91T7GADbAQlx_rU4kJrFHQ'
    }).addTo(mymap);

    const circle = L.circle(currentLatLng, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 50
    }).addTo(mymap);

    circle.bindPopup("You are here!").openPopup();

    function onMapClick(e) {
        currentLatLng = [e.latlng.lat, e.latlng.lng];
        circle.setLatLng(e.latlng);
        circle.bindPopup("Lost here!").openPopup();
    }

    mymap.on('click', onMapClick);

    document.getElementById("announcement").onclick = () => {
        const name = document.getElementById("name").value;
        const gender = document.getElementById("gender").value;
        const height = document.getElementById("height").value;
        const breed = document.getElementById("breed").value;
        const color = document.getElementById("color").value;
        const collar = document.getElementById("collar").value;
        const age = document.getElementById("age").value;
        const about = document.getElementById("about").value;
        const date = document.getElementById("date").value;
        const reward = document.getElementById("reward").value;

        const file = document.getElementById('image').files[0];
        const formData = new FormData();
        formData.append('file', file);

        if (name && gender && height && breed && color && collar && age && about && date && file) {
            const body = {
                name,
                gender,
                height,
                breed,
                color,
                collar,
                age: parseInt(age),
                about,
                date: new Date(date).toString(),
                lostLocation: currentLatLng,
                reviews: [],
            }

            if (reward) {
                body.reward = true;
                body.amount = parseInt(reward);
            } else {
                body.reward = false;
            }

            fetch(`http://127.0.0.1:6969/posts?user=${token}`, {
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
                        fetch(`http://127.0.0.1:6969/posts?post=${response.postId}`, {
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