window.onload = () => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:6969/posts/my-lost?user=${token}`)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                const {
                    posts
                } = response;

                if (posts.length > 0) {
                    document.getElementById("myPosts").innerHTML = '';

                    posts.forEach(post => {
                        document.getElementById("myPosts").innerHTML += `
                            <div class="post">
                                <div class="post-limiter">
                                    <a href="/client/post/post.html?post=${post._id}">
                                        <div class="postCard">
                                            <div class="imgPet">
                                                <img src="${post.photo}" alt="My pet" />
                                            </div>
                                            <div class="aboutPet">
                                                <div class="name">
                                                    <img src="${post.gender === "male" ? 'icons/gender-boy.svg' : 'icons/gender-girl.svg'}" alt="gender" />
                                                    <p>${post.name}</p>
                                                </div>
                                                <div class="about">
                                                    <div class="important">
                                                        <p>Where was lost: <br> <span>${post.lostAddress}</span></p>
                                                        <p>Date: <span>${new Date(post.timestamp).toLocaleDateString()}</span></p>
                                                    </div>
                                                    <div class="important">
                                                        <p>Breed: <span>${post.breed}</span></p>
                                                        <p>Height: <span>${post.height}</span></p>
                                                    </div>
                                                    <div>
                                                        <p>Color: <span>${post.color}</span></p>
                                                        <p>Collar: <span>${post.collar}</span></p>
                                                    </div>
                                                    <div class="descr">
                                                        <p>About it <br> <span>${post.about}</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    document.getElementById("myPosts").innerHTML = `<p>No lost pets.</p>`;
                }
            } else {
                alert(response.message);
            }
        })
        .catch(e => {
            console.log(e);
        });

    fetch(`http://127.0.0.1:6969/posts/another-lost?user=${token}`)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                const {
                    posts
                } = response;

                if (posts.length > 0) {
                    document.getElementById("anotherPosts").innerHTML = '';

                    posts.forEach(post => {
                        document.getElementById("anotherPosts").innerHTML += `
                            <div class="card">
                                <div class="header">
                                    <img class="petImg" src="${post.photo}" alt="My Pet" />
                                    <div class="profile">
                                        <img class="avatar" src="${post.user.profilePhoto}" alt="avatar" />
                                        <p> ${post.user.lastname} ${post.user.firstname}</p>
                                    </div>
                                    <div class="btn">
                                        <button type="button"> <img src="icons/chat.svg" alt="chat" /> <span> +3 </span> </button>
                                        <button type="button"> <img src="icons/share.svg" alt="share" /> </button>
                                    </div>
                                </div>

                                <div class="footer">
                                    <div class="info">
                                        <div class="data">
                                            <img src="${post.gender === "male" ? 'icons/gender-boy.svg' : 'icons/gender-girl.svg'}" alt="gender" />
                                            <div class="name">
                                                <p>${post.name}</p>
                                            </div>
                                        </div>
                                        <div class="location">
                                            <img src="icons/location.svg" alt="location" />
                                            <p>${post.lostAddress}</p>
                                        </div>
                                        <div class="date">
                                            <img src="icons/calendar.svg" alt="date" />
                                            <p>${new Date(post.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div class="found">
                                        <a href="/client/post/post.html?post=${post._id}"><span> Found it </span></a>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    document.getElementById("anotherPosts").innerHTML = `<p>No lost pets.</p>`;
                }
            } else {
                alert(response.message);
            }
        })
        .catch(e => {
            console.log(e);
        });
}