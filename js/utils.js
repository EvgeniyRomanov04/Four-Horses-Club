async function asyncWhile(condition, action) {
    return new Promise((resolve) => {
        function iterate() {
            if (!condition()) {
                resolve();
                return;
            }

            action();
            setTimeout(iterate, 0);
        }

        iterate();
    });
}