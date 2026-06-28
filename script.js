(function () {
    "use strict";

    var QUOTES = [
        { quote: "خوابوں کو حقیقت میں بدلنے کے لیے ہمت چاہیے۔", author: "جوش ملیح آبادی", lang: "ur" },
        { quote: "جو محنت کرتا ہے، وہی کامیاب ہوتا ہے۔", author: "مولانا الطاف حسین حالی", lang: "ur" },
        { quote: "خودی کو بلند کرو، تقدیر خود بدل جائے گی۔", author: "علامہ اقبال", lang: "ur" },
        { quote: "اتحاد، تنظیم، یقین محکم۔", author: "قائدِاعظم محمد علی جناح", lang: "ur" },
        { quote: "علم حاصل کرو، چاہے سفر کتنا ہی دور کیوں نہ ہو۔", author: "سر سید احمد خان", lang: "ur" },
        { quote: "صبر کا پھل ہمیشہ میٹھا ہوتا ہے۔", author: "بہادر شاہ ظفر", lang: "ur" },
        { quote: "وقت کسی کا انتظار نہیں کرتا۔", author: "فیض احمد فیض", lang: "ur" },
        { quote: "زندگی امید کے سہارے ہی چلتی ہے۔", author: "احمد فراز", lang: "ur" },
        { quote: "سچائی کا راستہ مشکل مگر روشن ہوتا ہے۔", author: "پروین شاکر", lang: "ur" },
        { quote: "اپنی منزل پر یقین رکھو، راستہ خود بن جائے گا۔", author: "مرزا غالب", lang: "ur" }
    ];

    var STORAGE_KEY = "rqg_favourites_v1";

    var els = {
        quoteText: document.getElementById("quoteText"),
        quoteAuthor: document.getElementById("quoteAuthor"),
        quoteBody: document.getElementById("quoteBody"),
        cardNumber: document.getElementById("cardNumber"),
        favBtn: document.getElementById("favBtn"),
        favIcon: document.getElementById("favIcon"),
        newQuoteBtn: document.getElementById("newQuoteBtn"),
        copyBtn: document.getElementById("copyBtn"),
        copyTooltip: document.getElementById("copyTooltip"),
        tweetBtn: document.getElementById("tweetBtn"),
        stamp: document.getElementById("stamp"),
        favList: document.getElementById("favList"),
        favEmpty: document.getElementById("favEmpty"),
        favCountLabel: document.getElementById("favCountLabel")
    };

    var recentIndices = [];   // last up-to-2 shown indices, to avoid repeats
    var currentIndex = null;
    var favourites = [];      // array of {quote, author, lang}

    function loadFavourites() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            favourites = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(favourites)) favourites = [];
        } catch (e) {
            favourites = [];
        }
    }

    function saveFavourites() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
        } catch (e) {
            // localStorage unavailable — favourites simply won't persist
        }
    }

    function isSameQuote(a, b) {
        return a.quote === b.quote && a.author === b.author;
    }

    function findFavouriteIndex(item) {
        for (var i = 0; i < favourites.length; i++) {
            if (isSameQuote(favourites[i], item)) return i;
        }
        return -1;
    }

    function pickNextIndex() {
        if (QUOTES.length === 1) return 0;
        var candidate;
        do {
            candidate = Math.floor(Math.random() * QUOTES.length);
        } while (recentIndices.indexOf(candidate) !== -1);
        return candidate;
    }

    function updateRecent(index) {
        recentIndices.push(index);
        while (recentIndices.length > 2) recentIndices.shift();
    }

    function updateFavButtonState() {
        var current = QUOTES[currentIndex];
        var pressed = findFavouriteIndex(current) !== -1;
        els.favBtn.setAttribute("aria-pressed", pressed ? "true" : "false");
    }

    function updateTweetLink() {
        var current = QUOTES[currentIndex];
        var text = '"' + current.quote + '" \u2014 ' + current.author;
        var url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
        els.tweetBtn.setAttribute("href", url);
    }

    function renderCardNumber(index) {
        var padded = String(index + 1).padStart(3, "0");
        els.cardNumber.textContent = padded;
    }

    function setTextDirection(isUrdu) {
        [els.quoteText, els.quoteAuthor].forEach(function (el) {
            if (isUrdu) {
                el.classList.add("rtl");
                el.setAttribute("dir", "rtl");
                el.setAttribute("lang", "ur");
            } else {
                el.classList.remove("rtl");
                el.setAttribute("dir", "ltr");
                el.setAttribute("lang", "en");
            }
        });
    }

    function applyQuote(index) {
        currentIndex = index;
        var item = QUOTES[index];
        var isUrdu = item.lang === "ur";
        els.quoteText.textContent = '\u201C' + item.quote + '\u201D';
        els.quoteAuthor.textContent = "\u2014 " + item.author;
        setTextDirection(isUrdu);
        renderCardNumber(index);
        updateFavButtonState();
        updateTweetLink();
    }

    function showNewQuote() {
        var nextIndex = pickNextIndex();
        updateRecent(nextIndex);

        els.quoteBody.classList.add("quote-fade-out");
        window.setTimeout(function () {
            applyQuote(nextIndex);
            els.quoteBody.classList.remove("quote-fade-out");
        }, 220);
    }

    function copyCurrentQuote() {
        var item = QUOTES[currentIndex];
        var text = '"' + item.quote + '" \u2014 ' + item.author;

        function showTooltip() {
            els.copyTooltip.classList.add("show");
            window.setTimeout(function () {
                els.copyTooltip.classList.remove("show");
            }, 2000);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(showTooltip, function () {
                fallbackCopy(text);
                showTooltip();
            });
        } else {
            fallbackCopy(text);
            showTooltip();
        }
    }

    function fallbackCopy(text) {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) { /* no-op */ }
        document.body.removeChild(ta);
    }

    function renderFavourites() {
        els.favList.innerHTML = "";
        els.favCountLabel.textContent = "(" + favourites.length + ")";
        els.favEmpty.style.display = favourites.length === 0 ? "block" : "none";

        favourites.forEach(function (item, idx) {
            var li = document.createElement("li");
            li.className = "fav-item";

            var textWrap = document.createElement("div");
            textWrap.className = "fav-item-text";

            var p = document.createElement("p");
            p.textContent = '\u201C' + item.quote + '\u201D';

            var span = document.createElement("span");
            span.textContent = item.author;

            if (item.lang === "ur") {
                p.setAttribute("dir", "rtl");
                p.setAttribute("lang", "ur");
                p.classList.add("rtl-fav");
                span.setAttribute("dir", "rtl");
                span.classList.add("rtl-fav");
            }

            textWrap.appendChild(p);
            textWrap.appendChild(span);

            var removeBtn = document.createElement("button");
            removeBtn.className = "fav-remove";
            removeBtn.setAttribute("aria-label", "Remove from favourites");
            removeBtn.textContent = "\u00D7";
            removeBtn.addEventListener("click", function () {
                removeFavouriteAt(idx);
            });

            li.appendChild(textWrap);
            li.appendChild(removeBtn);
            els.favList.appendChild(li);
        });
    }

    function removeFavouriteAt(idx) {
        var removed = favourites[idx];
        favourites.splice(idx, 1);
        saveFavourites();
        renderFavourites();
        if (removed && currentIndex !== null && isSameQuote(removed, QUOTES[currentIndex])) {
            updateFavButtonState();
        }
    }

    function toggleFavourite() {
        var current = QUOTES[currentIndex];
        var existingIndex = findFavouriteIndex(current);

        if (existingIndex !== -1) {
            favourites.splice(existingIndex, 1);
            els.favBtn.setAttribute("aria-pressed", "false");
        } else {
            favourites.push({ quote: current.quote, author: current.author, lang: current.lang });
            els.favBtn.setAttribute("aria-pressed", "true");
            triggerStamp();
        }
        popHeart();
        saveFavourites();
        renderFavourites();
    }

    function popHeart() {
        els.favIcon.classList.remove("pop");
        void els.favIcon.offsetWidth; // restart the animation each click
        els.favIcon.classList.add("pop");
    }

    function triggerStamp() {
        els.stamp.classList.add("show");
        window.setTimeout(function () {
            els.stamp.classList.remove("show");
        }, 1100);
    }

    function popButton(btn) {
        btn.classList.remove("pop");
        void btn.offsetWidth; // restart the animation each click
        btn.classList.add("pop");
    }

    // ---- wire up events ----
    els.newQuoteBtn.addEventListener("click", function () {
        popButton(els.newQuoteBtn);
        showNewQuote();
    });
    els.copyBtn.addEventListener("click", function () {
        popButton(els.copyBtn);
        copyCurrentQuote();
    });
    els.tweetBtn.addEventListener("click", function () {
        popButton(els.tweetBtn);
    });
    els.favBtn.addEventListener("click", toggleFavourite);

    // ---- init ----
    loadFavourites();
    renderFavourites();
    var startIndex = Math.floor(Math.random() * QUOTES.length);
    updateRecent(startIndex);
    applyQuote(startIndex);
})();