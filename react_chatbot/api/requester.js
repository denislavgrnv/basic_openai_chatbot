async function requester(method, url, data) {
    const options = {}

    if (method !== "GET") {
        options.method = method;
    }

    if (data) {
        options.headers = {
            'Content-type': "application/json",
        };
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    let result;
    try {
        result = await response.json();
    } catch {
        result = null; 
    }

    if (!response.ok) {
        const error = new Error(result?.message || response.statusText);
        error.status = response.status;
        throw error;
    }

    return result;
}

const get = (url, data) => requester("GET", url, data);
const post = (url, data) => requester("POST", url, data);
const put = (url, data) => requester("PUT", url, data);
const del = (url, data) => requester("DELETE", url, data);

export default {
    get,
    post,
    put,
    del,
}