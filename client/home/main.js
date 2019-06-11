window.onload = () => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:6969/users?user=${token}`)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                const {
                    user
                } = response;

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

    fetch(`http://127.0.0.1:6969/users/pets?user=${token}`)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                const {
                    pets
                } = response;

                document.getElementById("pets").innerHTML = "";

                pets.forEach(pet => {
                    document.getElementById("pets").innerHTML += `
                        <div class="pet-card">
                            <img alt="Pet's photo" src="${pet.photo}">
                            <div class="pets-name"><img alt="Gender" src="${pet.gender === "male" ? 'icons/gender-boy.svg' : 'icons/gender-girl.svg'}">
                                <h4>${pet.name}</h4>
                            </div>
                            <div class="trait">
                                <h5>Breed: </h5>
                                <p>${pet.breed}</p>
                            </div>
                            <div class="trait">
                                <h5>Color: </h5>
                                <p>${pet.color}</p>
                            </div>
                            <div class="trait">
                                <h5>Height: </h5>
                                <p>${pet.height}</p>
                            </div>
                            <div class="trait">
                                <h5>Age: </h5>
                                <p>${pet.age} years</p>
                            </div>
                            <div class="trait">
                                <h5>Collar: </h5>
                                <p>${pet.collar}</p>
                            </div>
                            <div class="trait">
                                <h5>About it:</h5>
                                <p>${pet.about}</p>
                            </div>
                        </div>
                    `;
                });
            } else {
                alert(response.message);
            }
        })
        .catch(e => {
            console.log(e);
        });

    fetch(`http://127.0.0.1:6969/posts/found-mine?user=${token}`)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                const {
                    posts
                } = response;

                console.log(posts);

                document.getElementById("foundPets").innerHTML = "";

                if (posts.length > 0) {
                    posts.forEach(post => {
                        document.getElementById("foundPets").innerHTML += `
                            <div class="pet-card">
                                <img alt="Pet's photo" src="${post.photo}">
                                <div class="pets-name"><img alt="Gender" src="${post.gender === "male" ? 'icons/gender-boy.svg' : 'icons/gender-girl.svg'}">
                                    <h4>${post.name}</h4>
                                </div>

                                <div class="profile-field">
                                    <img alt="Profile Icon" src="icons/calendar.svg">
                                    <p>${new Date(post.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div class="profile-field">
                                    <img alt="Profile Icon" src="icons/location.svg">
                                    <p>${post.lostAddress}</p>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    document.getElementById("foundPets").innerHTML = "No found pets.";
                }
            } else {
                alert(response.message);
            }
        })
        .catch(e => {
            console.log(e);
        });
};