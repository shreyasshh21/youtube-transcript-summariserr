document.getElementById('get-transcript').addEventListener('click', async () => {
    const url = document.getElementById('youtube-url').value;
    const videoId = extractVideoId(url);

    if (videoId) {
        try {
            const transcript = await fetchTranscript(videoId);
            const summary = await summarizeTranscript(transcript);
            displayTranscriptAndSummary(transcript, summary);
        } catch (error) {
            console.error(error);
            alert('An error occurred while fetching the transcript.');
        }
    } else {
        alert('Please enter a valid YouTube URL.');
    }
});

function extractVideoId(url) {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
}

async function fetchTranscript(videoId) {
    const apiKey = 'AIzaSyAczHO-3lq4ceHt2D3ag9CqiWTAvFtcSBs';
    const response = await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`);

    if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
        throw new Error('No captions found for this video.');
    }

    const captionId = data.items[0].id;
    const transcriptResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions/${captionId}?tfmt=srv3&key=${apiKey}`);

    if (!transcriptResponse.ok) {
        throw new Error(`YouTube API error: ${transcriptResponse.statusText}`);
    }

    const transcriptData = await transcriptResponse.text();
    
    return parseTranscript(transcriptData);
}

function parseTranscript(data) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    const texts = xmlDoc.getElementsByTagName("text");
    let transcript = "";

    for (let i = 0; i < texts.length; i++) {
        transcript += texts[i].textContent + " ";
    }
    
    return transcript;
}

async function summarizeTranscript(transcript) {
    const apiKey = 'sk-proj-JniHzI6VZktgyZMQLz0dT3BlbkFJI9OGbx1qABvLwIEVWfEy';
    const response = await fetch('https://api.summarization-service.com/summarize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ text: transcript })
    });

    if (!response.ok) {
        throw new Error(`Summarization API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.summary;
}

function displayTranscriptAndSummary(transcript, summary) {
    const transcriptSummaryElement = document.getElementById('transcript-summary');
    transcriptSummaryElement.innerHTML = `
        <h3>Transcript</h3>
        <p>${transcript}</p>
        <h3>Summary</h3>
        <p>${summary}</p>
    `;
}
