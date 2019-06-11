window.onload = () => {
    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');

    fetch(`http://127.0.0.1:6969/posts?post=${postId}`)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                const {
                    post
                } = response;

                document.getElementById("modal").innerHTML = `
                    <div class="left">
                        <div class="left">
                            <img alt="Pets Photo" src="${post.photo}">
                            <div id="map" style="height: 350px"></div>
                            ${post.found ? '' : '<button id="update">Update location</button>'}
                        </div>

                        <div class="right">
                            <h2>Pet's characteristics</h2>
                            <div class="info">
                                <div class="trait long">
                                    <h5>Name</h5>
                                    <p>${post.name}</p>
                                </div>
                                <div class="trait">
                                    <h5>Breed</h5>
                                    <p>${post.breed}</p>

                                    <h5>Color: </h5>
                                    <p>${post.color}</p>
                                </div>
                                <div class="trait">
                                    <h5>Height: </h5>
                                    <p>${post.height}</p>
                                    <h5>Age: </h5>
                                    <p>${post.age}</p>
                                </div>
                                <div class="trait">
                                    <h5>Collar: </h5>
                                    <p>${post.collar}</p>
                                </div>
                                <div class="trait long">
                                    <h5>About it:</h5>
                                    <p>${post.about}</p>
                                </div>
                            </div>
                            <h2>Loss info</h2>
                            <div class="info">
                                <div class="trait long">
                                    <h5>Date of loss</h5>
                                    <p>${new Date(post.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div class="trait long">
                                    <h5>Location of loss</h5>
                                    <p>${post.lostAddress}</p>
                                </div>
                            </div>
                            <h2>Bounty</h2>
                            <div class="info">
                                <div class="trait long">
                                    <h5>Does the owner offers a bounty?</h5>
                                    <p>${post.reward ? 'Yes. ' + post.amount + ' lei.' : 'No.'}</p>
                                </div>
                            </div>
                            ${post.found ? '<div class="found"><a><span>Founded</span></a></div>' : '<div class="found"><a id="foundPet"><span>Found it</span></a></div>'}
                        </div>

                    </div>

                    <div class="right" id="reviewsContainer">
                    No reviews yet.
                    </div>
                `;

                let currentLatLng = post.lostLocation;
                let changedLocation = false;
                const mymap = L.map('map').setView(currentLatLng, 16);

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

                circle.bindPopup("Lost here!").openPopup();

                function onMapClick(e) {
                    changedLocation = true;
                    currentLatLng = [e.latlng.lat, e.latlng.lng];
                    circle.setLatLng(e.latlng);
                    circle.bindPopup("Saw here!").openPopup();
                }

                mymap.on('click', onMapClick);

                if (post.reviews.length > 0) {
                    document.getElementById("reviewsContainer").innerHTML = "";

                    post.reviews.forEach(review => {
                        const circle = L.circle(review.latLng, {
                            color: 'red',
                            fillColor: '#f03',
                            fillOpacity: 0.5,
                            radius: 50
                        }).addTo(mymap);

                        circle.bindPopup(`${review.user.lastname} ${review.user.firstname}`);

                        document.getElementById("reviewsContainer").innerHTML += `
                            <div class="comment">
                                <img alt="Profile Photo" src="${review.user.profilePhoto}">
                                <div class="info">
                                    <p><b>
                                            <span>${review.user.lastname} ${review.user.firstname}</span>
                                        </b></p>
                                    <p>
                                        <span> saw your lost pet on</span>
                                    </p>
                                    <h5>${review.address}</h5>
                                    <p>${new Date(review.timestamp).toLocaleDateString()}</p>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    document.getElementById("reviewsContainer").innerHTML = "No reviews yet.";
                }

                if (document.getElementById("update")) {
                    document.getElementById("update").onclick = () => {
                        if (changedLocation) {
                            const body = {
                                token,
                                currentLatLng,
                                postId
                            }

                            fetch(`http://127.0.0.1:6969/posts/review`, {
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
                                        window.location.reload();
                                    }
                                })
                        }
                    }
                }

                if (document.getElementById("foundPet")) {
                    document.getElementById("foundPet").onclick = () => {
                        const body = {
                            token,
                            postId
                        }

                        fetch(`http://127.0.0.1:6969/posts/found`, {
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
                                    window.location.reload();
                                }
                            })
                    }
                }
            }
        })
        .catch(e => {
            console.log(e);
        });
}