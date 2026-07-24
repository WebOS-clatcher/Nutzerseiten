class ReportDialog extends Dialog {
    constructor(id) {
        super("Melde öffentlichen Post");

        const container = document.createElement("div");
        container.style.textAlign = "right";

        const div = document.createElement("div");
        div.className = "select-wrapper";
        div.innerHTML = '<i class="fas fa-caret-down"></i>';
        const select = document.createElement("select");
        select.innerHTML = `
            <option value="Dieser Post ist beleidigend">Dieser Post ist beleidigend</option>
            <option value="Dieser Post ist diskriminierend">Dieser Post ist diskriminierend</option>
            <option value="Dieser Post enthält persönliche Informationen">Dieser Post enthält persönliche Informationen</option>
            <option value="Dieser Post kommt von einem gehackten Useraccount">Dieser Post kommt von einem gehackten Useraccount</option>
            <option value="Der postende User verbreitet Malware über die Storage-Funktion">Der postende User verbreitet Malware über die Storage-Funktion</option>
            <option value="Dieser Post enthält pornografische Inhalte">Dieser Post enthält pornografische Inhalte</option>
            <option value="Dieser Post verstößt gegen deutsches oder europäisches Recht">Dieser Post verstößt gegen deutsches oder europäisches Recht</option>
        `;

        div.appendChild(select);
        container.appendChild(div);

        const btn = document.createElement("button");
        btn.className = "clatcher-btn mt-15";
        btn.textContent = "Melden";
        btn.addEventListener("click", () => {
            const grund = select.value;

            fetch("/report/comment", {
                method: "POST",
                body: JSON.stringify({
                    pid: id,
                    grund: grund
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(data => {
                new Toast(data.info).show();
            });
        });

        container.appendChild(btn);

        this.setBody(container);
    }
}

class EmbedDialog extends Dialog {
    constructor(id) {
        super("Kopiere embed link");

        const container = document.createElement("div");

        const embedCode = document.createElement("input");
        embedCode.className = "textfield clatcher-width mb-15";
        embedCode.value = '<iframe style="border: none; width: 350px; height: 600px;" src="https://' + location.hostname + '/embed/post/' + id + '"></iframe>';
        embedCode.addEventListener("click", () => {
            embedCode.select();
            navigator.clipboard.writeText(embedCode.value)
            .then(
                () => new Toast("Embedcode kopiert!").show(),
                () => new Toast("Embedcode konnte nicht kopiert werden").show()
            );
        });
        container.appendChild(embedCode);

        const embedLink = document.createElement("input");
        embedLink.className = "textfield clatcher-width mb-15";
        embedLink.value = 'https://' + location.hostname + '/embed/post/' + id;
        embedLink.addEventListener("click", () => {
            embedLink.select();
            navigator.clipboard.writeText(embedLink.value)
            .then(
                () => new Toast("Embedlink kopiert!").show(),
                () => new Toast("Embedlink konnte nicht kopiert werden").show()
            );
        });
        container.appendChild(embedLink);

        this.setBody(container);
    }
}

class SettingsDialog extends Dialog {
    constructor(parent, data) {
        super("Einstellungen");
        this.parent = parent;

        const form = document.createElement("form");
        form.style.cssText = `
            display: flex;
            flex-direction: column;
        `;

        const jobInput = document.createElement("input");
        jobInput.type = "text";
        jobInput.className = "textfield mb-5";
        jobInput.placeholder = "Job";
        jobInput.value = data.job;
        form.appendChild(jobInput);

        const locationInput = document.createElement("input");
        locationInput.type = "text";
        locationInput.className = "textfield mb-5";
        locationInput.placeholder = "Location";
        locationInput.value = data.location;
        form.appendChild(locationInput);

        const birthdayInput = document.createElement("input");
        birthdayInput.type = "date";
        birthdayInput.className = "textfield mb-5";
        birthdayInput.placeholder = "Birthday";
        birthdayInput.value = data.birthday;
        form.appendChild(birthdayInput);

        const websiteInput = document.createElement("input");
        websiteInput.type = "text";
        websiteInput.className = "textfield mb-5";
        websiteInput.placeholder = "Website";
        websiteInput.value = data.website;
        form.appendChild(websiteInput);

        const interestsInput = document.createElement("input");
        interestsInput.type = "text";
        interestsInput.className = "textfield mb-5";
        interestsInput.placeholder = "Interests";
        interestsInput.value = data.interests;
        form.appendChild(interestsInput);

        const eventtitleInput = document.createElement("input");
        eventtitleInput.type = "text";
        eventtitleInput.className = "textfield mb-5";
        eventtitleInput.placeholder = "Event Title";
        eventtitleInput.value = data.eventtitle;
        form.appendChild(eventtitleInput);

        const eventimageInput = document.createElement("input");
        eventimageInput.type = "file";
        eventimageInput.className = "clatcher-btn mb-5";
        form.appendChild(eventimageInput);

        const eventtextInput = document.createElement("textarea");
        eventtextInput.rows = 5;
        eventtextInput.className = "mb-5 clatcher-width";
        eventtextInput.placeholder = "Event Text";
        eventtextInput.value = data.eventtextedit;
        form.appendChild(eventtextInput);

        const submitBtn = document.createElement("input");
        submitBtn.type = "submit";
        submitBtn.className = "clatcher-btn";
        submitBtn.value = "Update";
        form.appendChild(submitBtn);

        form.addEventListener("submit", e => {
            e.preventDefault();

            const job = jobInput.value;
            const location = locationInput.value;
            const birthday = birthdayInput.value;
            const interests = interestsInput.value;
            const website = websiteInput.value;
            const eventtitle = eventtitleInput.value;
            const eventimage = eventimageInput.files[0];
            const eventtext = eventtextInput.value;

            if(eventtext.length > options.constants.MAX_CHARACTERS) {
                new Toast(`Maximal ${options.constants.MAX_CHARACTERS} Zeichen`).show();
                return;
            }

            if(eventimage && eventimage.size > options.constants.MAX_EVENTIMAGE_FILESIZE) {
                new Toast(`Maximal ${options.constants.MAX_EVENTIMAGE_FILESIZE / (1024*1024)} MB`).show();
                return;
            }

            const fd = new FormData();

            fd.append("job", job);
            fd.append("location", location);
            fd.append("birthday", birthday);
            fd.append("interests", interests);
            fd.append("website", website);
            fd.append("eventtitle", eventtitle);
            fd.append("eventimage", eventimage);
            fd.append("eventtext", eventtext);

            const xhr = new XMLHttpRequest();

            xhr.open("POST", "/upload/usersettings");

            xhr.upload.addEventListener("progress", e => {
                if(e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    submitBtn.value = `${percentComplete}%`;
                }
            });

            xhr.onload = () => {
                const response = JSON.parse(xhr.responseText);
                new Toast(response.info).show();

                if(response.code === 200) {
                    this.parent.loadUsersite(options.usersite.name);
                    this.parent.pid = 0;
                    this.parent.objectURLs.forEach(elem => URL.revokeObjectURL(elem));
                    this.parent.objectURLs = [];
                    this.close();
                }

                eventimageInput.value = "";
                submitBtn.value = "Update";
            };

            xhr.onerror = () => {
                new Toast("Fehler beim Upload").show();
                eventimageInput.value = "";
                submitBtn.value = "Update";
            };

            xhr.send(fd);
        });

        this.setBody(form);
    }
}

class Usersites extends Layer {
    constructor() {
        super("Nutzerseiten", "fas fa-link fa-fw", 600);

        this.pid = 0;
        this.objectURLs = [];

        this.container = document.createElement("div");

        this.usersites = document.createElement("div");
        this.usersites.style.cssText = `
            max-height: 500px;
            overflow-y: auto;
            margin-top: 15px;
        `;

        this.searchTimeout = null;

        document.addEventListener("loadUsersite", () => {
            this.loadUsersite(options.usersite.name);
        });

        this.setBody(this.container);

        this.onStart = () => {
            this.pid = 0;
            if(options.usersite.name !== null)
                this.loadUsersite(options.usersite.name);
            else
                this.start();
        };

        this.onClose = () => {
            this.objectURLs.forEach(elem => URL.revokeObjectURL(elem));
            this.objectURLs = [];
        };
    }

    loadUserComments(parent, pid) {
        parent.innerHTML = "";

        const h3 = document.createElement("h3");
        h3.textContent = "Antworten";
        parent.appendChild(h3);

        if(options.user.id !== 0) {
            const form = document.createElement("form");
            form.style.textAlign = "right";
            form.className = "ml-15 mr-15";

            const textarea = document.createElement("textarea");
            textarea.className = "mb-5 clatcher-width";
            textarea.placeholder = "Verfasse Kommentar";
            form.appendChild(textarea);

            const postBtn = document.createElement("button");
            postBtn.className = "clatcher-btn";
            postBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Post';
            postBtn.addEventListener("click", e => {
                e.preventDefault();

                const text = textarea.value;

                if(text.length <= 0) {
                    new Toast("Keine Eingabe").show();
                    return;
                }

                if(text.length > options.constants.MAX_CHARACTERS) {
                    new Toast(`Maximal ${options.constants.MAX_CHARACTERS} Zeichen`).show();
                    return;
                }

                fetch(`/post/publicanswer?pid=${pid}`, {
                    method: "POST",
                    body: JSON.stringify({
                        text: text
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(response => response.json())
                .then(data => {
                    new Toast(data.info).show();

                    if(data.code === 200) {
                        this.loadUserComments(parent, pid);
                    }
                });
            });
            form.appendChild(postBtn);

            parent.appendChild(form);
        }

        fetch(`/load/public/answers?user=${options.usersite.name}&pid=${pid}`, {
            method: "GET"
        })
        .then(response => response.json())
        .then(data => {
            data.info.forEach(elem => {
                elem.posttext = Evaluate.youtube(elem.posttext);
                elem.posttext = Evaluate.link(elem.posttext);

                const blockquote = document.createElement("blockquote");
                blockquote.className = "ml-15 mr-15 mb-5 clatcher-width";
                blockquote.style.borderLeft = "1px solid gray";
                blockquote.style.paddingLeft = "15px";

                const header = document.createElement("header");
                header.style.cssText = `
                    margin: 0 0 1rem;
                    font-size: 80%;
                    color: #6c757d;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                `;
                blockquote.appendChild(header);

                const logoImg = document.createElement("img");
                logoImg.classList.add("mr-5");
                logoImg.style.borderRadius = "50%";
                logoImg.alt = elem.username;
                logoImg.width = 25;
                logoImg.height = 25;
                logoImg.src = elem.userlogo ?? "/pics/default.png";
                header.appendChild(logoImg);

                const userSpan = document.createElement("span");
                userSpan.classList.add("mr-5");
                const userlink = document.createElement("a");
                userlink.textContent = elem.username;
                userlink.href = "javascript:void(0)";
                userlink.addEventListener("click", () => {
                    this.pid = 0;
                    options.usersite.name = elem.username;
                    this.objectURLs.forEach(elem => URL.revokeObjectURL(elem));
                    this.objectURLs = [];
                    document.dispatchEvent(options.events.loadUsersite);
                });
                userSpan.appendChild(userlink);
                header.appendChild(userSpan);

                const dateSpan = document.createElement("span");
                dateSpan.textContent = elem.postdate;
                header.appendChild(dateSpan);

                const textP = document.createElement("p");
                textP.style.textAlign = "justify";
                textP.innerHTML = elem.posttext.replaceAll("\n", "<br>");
                blockquote.appendChild(textP);

                const footer = document.createElement("footer");
                footer.className = "mt-15";
                footer.style.cssText = `
                    font-size: 80%;
                    color: #6c757d;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                `;
                blockquote.appendChild(footer);

                if(options.user.id !== 0 && (options.user.username === elem.username || options.user.admin === 1)) {
                    const deleteSpan = document.createElement("span");
                    const deleteLink = document.createElement("a");
                    deleteLink.className = "text-danger";
                    deleteLink.href = "javascript:void(0)";
                    deleteLink.textContent = "Löschen";
                    deleteLink.addEventListener("click", () => {
                        const id = elem.postsid;

                        fetch(`/delete/answer?aid=${id}`, {
                            method: "DELETE"
                        })
                        .then(response => response.json())
                        .then(data => {
                            new Toast(data.info).show();

                            if(data.code === 200) {
                                blockquote.remove();
                            }
                        });
                    });
                    deleteSpan.appendChild(deleteLink);
                    footer.appendChild(deleteSpan);
                }

                parent.appendChild(blockquote);
            });
        });
    }

    loadUserPosts(parent) {
        if(this.pid === 0) {
            parent.innerHTML = "";
            this.objectURLs.forEach(elem => URL.revokeObjectURL(elem));
            this.objectURLs = [];
        }

        fetch(`/load/public/comments?id=${this.pid}&user=${options.usersite.name}`, {
            method: "GET"
        })
        .then(response => response.json())
        .then(data => {
            data.info.forEach(elem => {
                if(elem.postbild !== null) {
                    const binary = atob(elem.postbild);
                    const len = binary.length;
                    const bytes = new Uint8Array(len);

                    for(let i = 0; i < len; ++i) {
                        bytes[i] = binary.charCodeAt(i);
                    }

                    const blob = new Blob([bytes], { type: elem.mime });
                    this.objectURLs.push(URL.createObjectURL(blob));
                    elem.postbild = this.objectURLs[this.objectURLs.length - 1];

                    if(elem.mime === "video/mp4")
                        elem.video = true;
                    else
                        elem.video = false;
                }

                elem.posttext = Evaluate.youtube(elem.posttext);
                elem.posttext = Evaluate.link(elem.posttext);

                const blockquote = document.createElement("blockquote");
                blockquote.className = "ml-15 mr-15 mb-5 clatcher-width";

                const header = document.createElement("header");
                header.style.cssText = `
                    margin: 0 0 1rem;
                    font-size: 80%;
                    color: #6c757d;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                `;
                blockquote.appendChild(header);

                const logoImg = document.createElement("img");
                logoImg.classList.add("mr-5");
                logoImg.style.borderRadius = "50%";
                logoImg.alt = elem.username;
                logoImg.width = 25;
                logoImg.height = 25;
                logoImg.src = (elem.userlogo !== null) ? elem.userlogo : "/pics/default.png";
                header.appendChild(logoImg);

                const userSpan = document.createElement("span");
                userSpan.classList.add("mr-5");
                const userlink = document.createElement("a");
                userlink.textContent = elem.username;
                userlink.href = "javascript:void(0)";
                userlink.addEventListener("click", () => {
                    this.pid = 0;
                    options.usersite.name = elem.username;
                    document.dispatchEvent(options.events.loadUsersite);
                });
                userSpan.appendChild(userlink);
                header.appendChild(userSpan);

                const dateSpan = document.createElement("span");
                dateSpan.textContent = elem.postdate;
                header.appendChild(dateSpan);

                const textP = document.createElement("p");
                textP.style.textAlign = "justify";
                textP.innerHTML = elem.posttext.replaceAll("\n", "<br>");
                blockquote.appendChild(textP);

                if(elem.video === true) {
                    const div = document.createElement("div");
                    div.className = "embed-responsive embed-responsive-16by9";
                    const video = document.createElement("video");
                    video.className = "embed-responsive-item";
                    video.controls = true;
                    div.appendChild(video);
                    const source = document.createElement("source");
                    source.type = elem.mime;
                    source.src = elem.postbild;
                    video.appendChild(source);
                    blockquote.appendChild(div);
                }
                else if(elem.video === false) {
                    const div = document.createElement("div");
                    div.className = "embed-responsive embed-responsive-16by9";
                    const img = document.createElement("img");
                    img.style.cursor = "pointer";
                    img.className = "embed-responsive-item";
                    img.src = elem.postbild;
                    img.addEventListener("click", () => {
                        new ImageViewer(img.src).show();
                    });
                    div.appendChild(img);
                    blockquote.appendChild(div);
                }

                const footer = document.createElement("footer");
                footer.className = "mt-15";
                footer.style.cssText = `
                    font-size: 80%;
	                color: #6c757d;
	                display: flex;
	                flex-direction: row;
	                align-items: center;
                `;
                blockquote.appendChild(footer);

                if(elem.sharedid !== null) {
                    const sharedNameSpan = document.createElement("span");
                    sharedNameSpan.className = "mr-5";
                    sharedNameSpan.innerHTML = '<i class="fas fa-share-alt"></i> ';
                    const sharedNameLink = document.createElement("a");
                    sharedNameLink.href = "javascript:void(0)";
                    sharedNameLink.textContent = elem.sharedname;
                    sharedNameLink.addEventListener("click", () => {
                        options.usersite.name = elem.sharedname;
                        document.dispatchEvent(options.events.loadUsersite);
                    });
                    sharedNameSpan.appendChild(sharedNameLink);
                    footer.appendChild(sharedNameSpan);
                }

                const shareSpan = document.createElement("span");
                shareSpan.className = "mr-5";
                const shareLink = document.createElement("a");
                shareLink.textContent = "Teilen";
                shareLink.href = "javascript:void(0)";
                shareLink.addEventListener("click", () => {
                    const id = (elem.sharedid !== null) ? elem.sharedid : elem.postsid;
                    const name = (elem.sharedname !== null) ? elem.sharedname : elem.username;

                    fetch(`/share/publiccomment?id=${id}&user=${name}`, {
                        method: "POST"
                    })
                    .then(response => response.json())
                    .then(data => {
                        new Toast(data.info).show();
                    });
                });
                shareSpan.appendChild(shareLink);
                footer.appendChild(shareSpan);

                const embedSpan = document.createElement("span");
                embedSpan.className = "mr-5";
                const embedLink = document.createElement("a");
                embedLink.href = "javascript:void(0)";
                embedLink.textContent = "Embed";
                embedLink.addEventListener("click", () => {
                    const id = (elem.sharedid !== null) ? elem.sharedid : elem.postsid;

                    new EmbedDialog(id).show();
                });
                embedSpan.appendChild(embedLink);
                footer.appendChild(embedSpan);

                const reportSpan = document.createElement("span");
                reportSpan.className = "mr-5";
                const reportLink = document.createElement("a");
                reportLink.href = "javascript:void(0)";
                reportLink.textContent = "Melden";
                reportLink.addEventListener("click", () => {
                    if(options.user.id === 0) {
                        new Toast("Du musst angemeldet sein, um einen Post melden zu können.").show();
                        return;
                    }

                    const id = (elem.sharedid !== null) ? elem.sharedid : elem.postsid;

                    new ReportDialog(id).show();
                });
                reportSpan.appendChild(reportLink);
                footer.appendChild(reportSpan);

                if(options.user.id !== 0 && elem.sharedid !== null) {
                    const stopSharingSpan = document.createElement("span");
                    stopSharingSpan.className = "mr-5";
                    const stopSharingLink = document.createElement("a");
                    stopSharingLink.href = "javascript:void(0)";
                    stopSharingLink.className = "text-danger";
                    stopSharingLink.textContent = "Nicht mehr teilen";
                    stopSharingLink.addEventListener("click", () => {
                        const sid = elem.sharedid;

                        fetch(`/delete/share?pid=${sid}`, {
                            method: "DELETE"
                        })
                        .then(response => response.json())
                        .then(data => {
                            new Toast(data.info).show();
                            if(data.code === 200)
                                blockquote.remove();
                        });
                    });
                    stopSharingSpan.appendChild(stopSharingLink);
                    footer.appendChild(stopSharingSpan);
                }
                else if(options.user.id !== 0 && elem.sharedid === null) {
                    const deleteSpan = document.createElement("span");
                    const deleteLink = document.createElement("a");
                    deleteLink.href = "javascript:void(0)";
                    deleteLink.className = "text-danger";
                    deleteLink.textContent = "Löschen";
                    deleteLink.addEventListener("click", () => {
                        const pid = elem.postsid;

                        fetch(`/delete/comment?pid=${pid}`, {
                            method: "DELETE"
                        })
                        .then(response => response.json())
                        .then(data => {
                            new Toast(data.info).show();
                            if(data.code === 200)
                                blockquote.remove();
                        });
                    });
                    deleteSpan.appendChild(deleteLink);
                    footer.appendChild(deleteSpan);
                }

                const comments = document.createElement("div");
                comments.style.cssText = `
                    margin-top: 15px;
                    margin-left: 15px;
                    margin-bottom: 15px;
                    padding-left: 15px;
                    border-left: 1px solid gray;
                `;
                comments.style.display = "none";

                const commentsLink = document.createElement("a");
                commentsLink.href = "javascript:void(0)";
                commentsLink.style.marginLeft = "auto";
                commentsLink.textContent = "Kommentare";
                commentsLink.addEventListener("click", e => {
                    e.preventDefault();

                    const id = (elem.sharedid !== null) ? elem.sharedid : elem.postsid;

                    if(comments.style.display === "none") {
                        comments.style.display = "block";
                        this.loadUserComments(comments, id);
                    }
                    else {
                        comments.innerHTML = "";
                        comments.style.display = "none";
                    }
                });
                footer.appendChild(commentsLink);
                blockquote.appendChild(comments);

                parent.appendChild(blockquote);
            });

            if(data.info.length > 0) {
                this.pid = data.info[data.info.length-1].postsid;
                parent.nextElementSibling?.remove();
                parent.insertAdjacentHTML("afterend", '<a href="javascript:void(0)" class="mt-15">Mehr</a>');
                parent.nextElementSibling.addEventListener("click", () => {
                    this.loadUserPosts(parent);
                });
            }
            else {
                parent.nextElementSibling?.remove();
            }
        });
    }

    loadUsersite(username) {
        fetch(`/${username}`, {
            method: "GET"
        })
        .then(response => response.json())
        .then(data => {
            if(data.code === 404) {
                new Toast(username + " hat seine Nutzerseite nicht aktiviert").show();
                options.usersite.name = null;
                this.start();
                return;
            }

            new Toast(`Zeige Nutzerseite von ${username}`).show();
            this.setTitle(username);
            this.container.innerHTML = "";

            const navigation = document.createElement("div");
            navigation.className = "mt-n15 ml-n15 mr-n15 clatcher-fullwidth";
            navigation.style.cssText = `
                display: flex;
                flex-direction: row;
            `;

            const backBtn = document.createElement("button");
            backBtn.classList.add("clatcher-btn");
            backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
            backBtn.addEventListener("click", () => {
                this.pid = 0;
                options.usersite.name = null;
                this.objectURLs.forEach(elem => URL.revokeObjectURL(elem));
                this.objectURLs = [];
                this.start();
            });
            navigation.appendChild(backBtn);

            if(data.info.banned === 1) {
                const span = document.createElement("span");
                span.style.fontWeight = "bold";
                span.classList.add("text-danger");
                span.textContent = "Dieser Nutzer wurde gesperrt.";
                navigation.appendChild(span);
            }

            if(options.user.username === data.info.username) {
                const edit = document.createElement("button");
                edit.classList.add("clatcher-btn");
                edit.style.marginLeft = "auto";
                edit.textContent = "Bearbeiten";
                edit.addEventListener("click", () => {
                    new SettingsDialog(this, {
                        job: data.info.job,
                        location: data.info.location,
                        birthday: data.info.birthday,
                        website: data.info.website,
                        interests: data.info.interests,
                        eventtitle: data.info.eventtitle,
                        eventtextedit: data.info.eventtextedit
                    }).show();
                });
                navigation.appendChild(edit);
            }
            this.container.appendChild(navigation);

            if(data.info.userheader) {
                const header = document.createElement("div");
                header.style.marginTop = "-37px";
                header.className = "ml-n15 mr-n15 clatcher-fullwidth";
                header.style.height = "200px";
                header.style.backgroundRepeat = "no-repeat";
                header.style.backgroundSize = "100% 100%";
                header.style.backgroundImage = `url(${data.info.userheader})`;
                this.container.appendChild(header);
            }

            const content = document.createElement("div");
            content.className = "ml-n15 mr-n15 clatcher-fullwidth";
            content.style.cssText = `
                max-height: 500px;
                overflow-y: auto;
            `;

            if(data.info.eventtitle) {
                const h3 = document.createElement("h3");
                h3.className = "ml-15 mr-15";
                h3.style.textAlign = "left";
                h3.textContent = data.info.eventtitle;
                content.appendChild(h3);
            }

            if(data.info.eventimage) {
                const img = document.createElement("img");
				img.style.cursor = "pointer";
                img.classList.add("clatcher-width");
                img.src = data.info.eventimage;
				img.addEventListener("click", () => {
					new ImageViewer(img.src).show();
				});
                content.appendChild(img);
            }

            if(data.info.eventtext) {
                const p = document.createElement("p");
                p.className = "ml-15 mr-15";
                p.style.textAlign = "justify";
                p.innerHTML = data.info.eventtext;
                content.appendChild(p);
            }

            const profil = document.createElement("fieldset");
            profil.className = "mt-15 ml-15 mr-15";
            const profilTitle = document.createElement("legend");
            profilTitle.textContent = "Profil";
            profil.appendChild(profilTitle);

            const jobP = document.createElement("p");
            jobP.style.textAlign = "left";
            jobP.innerHTML = '<i class="fas fa-pencil-alt fa-fw"></i> ';
            jobP.appendChild(document.createTextNode(data.info.job ? data.info.job : "---"));
            profil.appendChild(jobP);

            const locationP = document.createElement("p");
            locationP.style.textAlign = "left";
            locationP.innerHTML = '<i class="fa fa-home fa-fw"></i> ';
            locationP.appendChild(document.createTextNode(data.info.location ? data.info.location : "---"));
            profil.appendChild(locationP);

            const birthdayP = document.createElement("p");
            birthdayP.style.textAlign = "left";
            birthdayP.innerHTML = '<i class="fa fa-birthday-cake fa-fw"></i> ';
            birthdayP.appendChild(document.createTextNode(data.info.birthday ? data.info.birthday.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3.$2.$1") : "---"));
            profil.appendChild(birthdayP);

            const websiteP = document.createElement("p");
            websiteP.style.textAlign = "left";
            websiteP.innerHTML = `<i class="fas fa-link fa-fw"></i> ${data.info.website ? Evaluate.link(data.info.website) : "---"}`;
            profil.appendChild(websiteP);

            content.appendChild(profil);

            const interests = document.createElement("fieldset");
            interests.className = "ml-15 mr-15";
            const interestsTitle = document.createElement("legend");
            interestsTitle.textContent = "Interessen";
            interests.appendChild(interestsTitle);

            const interestsP = document.createElement("p");
            interestsP.style.textAlign = "left";
            interestsP.textContent = data.info.interests ? data.info.interests.replaceAll(" ", ", ") : "---";
            interests.appendChild(interestsP);

            content.appendChild(interests);

            const h2 = document.createElement("h2");
            h2.textContent = `Beiträge von ${data.info.username}`;
            content.appendChild(h2);

            if(options.user.id !== 0 && options.user.username === data.info.username) {
                const form = document.createElement("form");
                form.className = "ml-15 mr-15";

                const textarea = document.createElement("textarea");
                textarea.className = "mb-5 clatcher-width";
                textarea.placeholder = "Verfasse Beitrag";
                form.appendChild(textarea);

                const inputGroup = document.createElement("div");
                inputGroup.className = "input-group mb-5";

                const fileLabel = document.createElement("label");
                fileLabel.className = "clatcher-btn";
                fileLabel.innerHTML = '<i class="far fa-image"></i> Image/Video';
                const fileInput = document.createElement("input");
                fileInput.style.display = "none";
                fileInput.type = "file";
                fileLabel.appendChild(fileInput);
                inputGroup.appendChild(fileLabel);

                const postBtn = document.createElement("button");
                postBtn.className = "clatcher-btn";
                postBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Post';
                postBtn.addEventListener("click", e => {
                    e.preventDefault();

                    const text = textarea.value;
                    const file = fileInput.files[0];

                    if(text.length <= 0 && !file) {
                        new Toast("Keine Eingabe").show();
                        return;
                    }

                    if(text.length > options.constants.MAX_CHARACTERS) {
                        new Toast(`Maximal ${options.constants.MAX_CHARACTERS} Zeichen`).show();
                        return;
                    }

                    if(file && file.size > options.constants.MAX_VIDEO_FILESIZE) {
                        new Toast(`Maximal ${options.constants.MAX_VIDEO_FILESIZE / (1024*1024)} MB`).show();
                        fileInput.value = "";
                        return;
                    }

                    const fd = new FormData();

                    fd.append("file", file);
                    fd.append("text", text);

					postBtn.disabled = true;
                    const xhr = new XMLHttpRequest();
                    xhr.open("POST", "/post/publiccomment");

                    xhr.upload.addEventListener("progress", e => {
                        if(e.lengthComputable) {
                            const percentComplete = Math.round((e.loaded / e.total) * 100);
                            postBtn.innerHTML = `<i class="fas fa-pencil-alt"></i> ${percentComplete}%`;
                        }
                    });

                    xhr.onload = () => {
                        const response = JSON.parse(xhr.responseText);

                        new Toast(response.info).show();

                        if(response.code === 200) {
                            this.pid = 0;
                            this.loadUsersite(options.usersite.name);
                        }
                    };

                    xhr.onerror = () => {
                        new Toast("Fehler beim Upload").show();
                    }

					xhr.onloadend = () => {
						textarea.value = "";
						fileInput.value = "";
						postBtn.disabled = false;
						postBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Post';
					};

                    xhr.send(fd);
                });
                inputGroup.appendChild(postBtn);
                form.appendChild(inputGroup);

                content.appendChild(form);
            }

            const posts = document.createElement("div");
            this.loadUserPosts(posts);
            content.appendChild(posts);

            this.container.appendChild(content);
        });
    }

    start() {
        this.container.innerHTML = "";
        this.usersites.innerHTML = "";
        this.setTitle("Nutzerseiten");

        const h1 = document.createElement("h1");
        h1.textContent = "Nutzerseiten Suche";
        this.container.appendChild(h1);

        const inputsearch = document.createElement("input");
        inputsearch.placeholder = "Nutzername";
        inputsearch.classList.add("textfield");
        inputsearch.classList.add("clatcher-width");
        inputsearch.addEventListener("keyup", () => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.usersites.innerHTML = "";
                this.loadUserSites(inputsearch.value);
            }, 300);
        });
        this.container.appendChild(inputsearch);

        this.container.appendChild(this.usersites);

        this.loadUserSites();
    }

    async loadUserSites(username="") {
        await fetch(`/load/usersite/information?username=${username}`, {
            method: "GET"
        })
        .then(response => response.json())
        .then(data => {
            const count = data.info.length;
            const singularOrPlural = (count > 1) ? "Userseiten" : "Userseite";
            const p = document.createElement("p");
            p.style.cssText = `
            text-align: left;
            color: lightgray;
            font-size: 10pt;
            margin-bottom: 15px;`;
            p.textContent = `${data.info.length} ${singularOrPlural} gefunden.`;
            this.usersites.appendChild(p);

            for(let i = 0; i < data.info.length; ++i) {
                const blockquote = document.createElement("blockquote");
                blockquote.style.cssText = `
                margin: 0 0 1rem;
                border-radius: .5em;
                padding: .25em;
                text-align: justify;
                cursor: pointer;
                user-select: none;`;

                blockquote.addEventListener("mouseover", () => {
                    blockquote.style.backgroundColor = "darkblue";
                });

                blockquote.addEventListener("mouseout", () => {
                    blockquote.style.backgroundColor = "";
                });

                blockquote.addEventListener("click", e => {
                    options.usersite.name = data.info[i].username;
                    document.dispatchEvent(options.events.loadUsersite);
                });

                const job = (data.info[i].job === null) ? "---" : data.info[i].job;
                const jobP = document.createElement("p");
                jobP.innerHTML = '<i class="fas fa-pencil-alt"></i> ';
                jobP.appendChild(document.createTextNode(job));
                blockquote.appendChild(jobP);

                const location = (data.info[i].location === null) ? "---" : data.info[i].location;
                const locationP = document.createElement("p");
                locationP.innerHTML = '<i class="fa fa-home fa-fw"></i> ';
                locationP.appendChild(document.createTextNode(location));
                blockquote.appendChild(locationP);

                const birthday = (data.info[i].birthday === null) ? "---" : data.info[i].birthday;
                const birthdayP = document.createElement("p");
                birthdayP.innerHTML = '<i class="fa fa-birthday-cake fa-fw"></i> ';
                birthdayP.appendChild(document.createTextNode(birthday));
                blockquote.appendChild(birthdayP);

                let website = (data.info[i].website === null) ? "---" : data.info[i].website;
                const websiteP = document.createElement("p");
                if(website !== "---") {
                    website = `<a href="${website}" target="_blank">${website}</a>`;
                }
                websiteP.innerHTML = `<i class="fas fa-link fa-fw"></i> ${website}`;
                blockquote.appendChild(websiteP);

                const footer = document.createElement("footer");
                footer.style.cssText = `
                font-size: 80%;
                color: #6c757d;
                display: flex;
                flex-direction: row;
                align-items: center;`;

                const img = document.createElement("img");
                img.style.borderRadius = "50%";
                img.src = (data.info[i].userlogo !== null) ? data.info[i].userlogo : "/pics/default.png";
                img.alt = data.info[i].username;
                img.height = "25";
                img.width = "25";
                footer.appendChild(img);

                const span = document.createElement("span");
                span.style.marginLeft = "5px";
                span.textContent = data.info[i].username;
                footer.appendChild(span);

                blockquote.appendChild(footer);

                this.usersites.appendChild(blockquote);
            }
        });
    }
}

manager.registerLayer({
    layer: new Usersites(),
    where: options.layerVisibility.both
});