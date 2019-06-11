window.onload = () => {
    fetch(`http://127.0.0.1:6969/posts/found`)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                const {
                    posts
                } = response;

                if (posts.length > 0) {
                    document.getElementById("postsContainer").innerHTML = '';

                    posts.forEach(post => {
                        document.getElementById("postsContainer").innerHTML += `
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
                                        <a><span> Founded </span></a>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    document.getElementById("postsContainer").innerHTML = `<p>No found pets.</p>`;
                }
            } else {
                alert(response.message);
            }
        })
        .catch(e => {
            console.log(e);
        });
}