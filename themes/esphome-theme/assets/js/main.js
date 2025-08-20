function trapScroll(el) {
    el.addEventListener('wheel', (e) => {
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight;
        const offsetHeight = el.offsetHeight;
        const delta = e.deltaY;

        const atTop = scrollTop === 0;
        const atBottom = scrollTop + offsetHeight >= scrollHeight;

        if ((atTop && delta < 0) || (atBottom && delta > 0)) {
            e.preventDefault();
        }
    }, {passive: false});
}

function trapTouchScroll(el) {
    let startY = 0;

    el.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, {passive: true});

    el.addEventListener('touchmove', (e) => {
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight;
        const offsetHeight = el.offsetHeight;
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;

        const atTop = scrollTop === 0;
        const atBottom = scrollTop + offsetHeight >= scrollHeight;

        if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
            e.preventDefault();
        }
    }, {passive: true});
}

function printCleanup(originalSrcs) {
    window.addEventListener('afterprint', () => {
        originalSrcs.forEach((base64Src, img) => {
            // Restore only if its src was changed for print
            if (img.dataset.src && img.src !== base64Src) {
                img.src = base64Src; // Restore the base64 thumbnail
                img.classList.remove("loaded-for-print");
                img.classList.remove("loading-for-print");
                img.classList.remove("loaded"); // If you use this class
            }
        });
    }, {once: true});
}

function prepareAndPrint() {
    let originalSrcs = new Map(); // Store original base64 srcs
    const imagesToLoad = document.querySelectorAll("img.lazyload[data-src]");
    let imagesLoadedCount = 0;
    const totalImages = imagesToLoad.length;
    console.log(`Starting image preload for print., ${totalImages} images found.`);

    if (totalImages === 0) {
        return;
    }

    imagesToLoad.forEach(img => {
        if (!originalSrcs.has(img)) {
            originalSrcs.set(img, img.src); // Store the current (thumbnail) src
        }

        // If the image is already loaded (from scrolling), don't re-trigger onload
        if (img.src === img.dataset.src) {
            imagesLoadedCount++; // Count it as already loaded
        } else {
            // Temporarily set the src to trigger download
            img.src = img.dataset.src;
            img.srcset = img.dataset.srcset;
            img.classList.add("loading-for-print"); // Add a class for visual feedback if needed
            img.classList.remove("lazyload");

            // Use an onload listener to track completion
            const handleLoad = () => {
                imagesLoadedCount++;
                img.removeEventListener('load', handleLoad); // Remove listener to prevent multiple calls
                img.classList.remove("loading-for-print");
                img.classList.add("loaded-for-print");

                if (imagesLoadedCount === totalImages) {
                    // All images are loaded, now trigger print
                    printCleanup(originalSrcs);
                }
            };
            img.addEventListener('load', handleLoad);
            // Add an error listener too, just in case an image fails to load
            img.addEventListener('error', () => {
                console.error(`  - Failed to load image: ${img.dataset.src}. Proceeding with print.`);
                imagesLoadedCount++; // Still count it to unblock printing
                img.removeEventListener('load', handleLoad); // Clean up load listener
                img.classList.remove("loading-for-print");
                img.classList.add("failed-to-load-for-print");
                if (imagesLoadedCount === totalImages) {
                    printCleanup(originalSrcs);
                }
            });
        }
    });

    // Handle case where all images were already loaded (e.g., after scrolling)
    if (imagesLoadedCount === totalImages) {
        printCleanup(originalSrcs);
    }
}


document.addEventListener('DOMContentLoaded', function () {

    const scrollers = document.querySelectorAll('.scroll-trap');

    for (let i = 0; i !== scrollers.length; i++) {
        trapScroll(scrollers[i]);
        trapTouchScroll(scrollers[i]);
    }

    window.addEventListener("beforeprint", (event) => {
        event.preventDefault();
        prepareAndPrint(); }
    );

    document.querySelectorAll('.copy-link').forEach(button => {
        button.addEventListener('click', async () => {
            const anchor = button.getAttribute('data-anchor');
            const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
            await navigator.clipboard.writeText(url)
            // Remove the class if it’s already there (to restart the animation)
            button.classList.remove('spin-once');

            // Trigger reflow to "restart" the animation
            void button.offsetWidth;

            // Add the class to trigger the spin
            button.classList.add('spin-once');
        });
    });



    // Copy button functionality
    const copyButtons = document.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const codeBlock = button.closest('.code-block');
            const yamlContent = codeBlock.querySelector('.codeblock-content');
            const code = yamlContent.textContent;

            try {
                await navigator.clipboard.writeText(code);
                const feedback = button.querySelector(".copy-feedback");
                if (feedback) {
                    feedback.textContent = "Copied!";
                }
                button.classList.add('copied');
                setTimeout(() => {
                    button.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });

    const scrollThreshold = 5; // Minimum scroll amount before triggering hide/show
    const navContainer = document.getElementById('nav-container');
    let scrollDelta = 0; // Track cumulative scroll amount
    let lastScrollTop = 0;


    function scroll_bar(newDelta) {
        let navHeight = navContainer.offsetHeight;
        // Remove the transition class when scrolling down for direct tracking
        navContainer.classList.remove('nav-scrolling-up');

        // Increase the scroll delta by the amount scrolled - start immediately from top
        scrollDelta += newDelta;

        // Cap the scroll delta at the nav height
        scrollDelta = Math.min(scrollDelta, navHeight);

        // Apply the transform
        navContainer.style.transform = `translateY(-${scrollDelta}px)`;

        // If fully hidden, add the nav-hidden class
        if (scrollDelta >= navHeight) {
            navContainer.classList.add('nav-hidden');
        }
    }

    // Header scroll behavior
    let ticking = false; // Flag to prevent multiple rAF calls
    let tocScroll = false;
    let scrollEndTimeout = null;


    function handleScroll() {
        if (tocScroll) {
            clearTimeout(scrollEndTimeout);
            scrollEndTimeout = setTimeout( () => { tocScroll = false; }, 100);
            ticking = false;
            return;
        }
        const currentScrollTop = window.scrollY || document.documentElement.scrollTop;

        // Check if we've scrolled more than the threshold
        if (Math.abs(lastScrollTop - currentScrollTop) <= scrollThreshold) {
            ticking = false;
            return;
        }

        // Scrolling down - directly track the scroll position
        if (currentScrollTop > lastScrollTop) {
            scroll_bar(currentScrollTop - lastScrollTop);
        }
        // Scrolling up - smooth transition back
        else if (currentScrollTop < lastScrollTop) {
            // Reset the scroll delta
            scrollDelta = 0;

            // Add transition class for smooth appearance
            navContainer.classList.add('nav-scrolling-up');
            navContainer.classList.remove('nav-hidden');
            navContainer.style.transform = 'translateY(0)';
        }

        lastScrollTop = currentScrollTop;
        ticking = false;
    }

    // Use requestAnimationFrame for better performance
    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    });

    const buildInfoButton = document.getElementById('build-info-button');
    const buildInfoPopup = document.getElementById('build-info-popup');
    const buildInfoClose = document.querySelector('.build-info-close');

    if (buildInfoButton && buildInfoPopup) {
        buildInfoButton.addEventListener('click', function() {
            buildInfoPopup.style.display = 'block';
        });

        buildInfoClose.addEventListener('click', function() {
            buildInfoPopup.style.display = 'none';
        });

        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.key === 'Esc') {
                buildInfoPopup.style.display = 'none';
            }
        });

        window.addEventListener('click', function(event) {
            if (event.target === buildInfoPopup) {
                buildInfoPopup.style.display = 'none';
            }
        });
    }

    // Table of Contents highlighting
    const tocLinks = document.querySelectorAll('.toc-entry');
    if (tocLinks.length > 0) {
        // Get all headings that correspond to TOC entries
        const headings = Array.from(tocLinks).map(link => {
            const id = link.getAttribute('href').substring(1);
            return document.getElementById(id);
        }).filter(Boolean);

        // Add smooth scrolling to TOC links
        tocLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                closeTOC();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    tocScroll = true;
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Offset for fixed header
                        behavior: 'smooth'
                    });
                    scroll_bar(navContainer.offsetHeight);

                    // Update URL hash without jumping
                    history.pushState(null, null, `#${targetId}`);
                }
            });
        });
    }

});

