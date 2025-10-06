document.getElementById('analyzeBtn').addEventListener('click', () => {
    const address = document.getElementById('trxAddress').value.trim();
    if (address) {
        fetchTransactions(address);
    } else {
        showError('Bhai, address to daalo!');
    }
});

function showLoader(show) {
    document.getElementById('loader').classList.toggle('hidden', !show);
}

function showResults(show) {
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.toggle('hidden', !show);
    if (show) {
        setTimeout(() => resultsSection.classList.add('visible'), 10);
    } else {
        resultsSection.classList.remove('visible');
    }
}

function showError(message) {
    const errorSection = document.getElementById('error-section');
    document.getElementById('errorText').textContent = message;
    errorSection.classList.remove('hidden');
    showResults(false);
}

async function fetchTransactions(address) {
    showLoader(true);
    showResults(false);
    document.getElementById('error-section').classList.add('hidden');

    // ✅ Tumhara TronGrid API key directly yahan daala gaya hai
    const API_KEY = '0fd95eed-a578-4a16-a30f-bdafe86bf51d';
    const url = `https://api.trongrid.io/v1/accounts/${address}/transactions?limit=200&only_confirmed=true`;

    try {
        const response = await fetch(url, {
            headers: {
                'TRON-PRO-API-KEY': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error('Network response theek nahi tha ya address galat hai.');
        }

        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            analyzeData(result.data);
        } else {
            showError('Is address par koi transactions nahi mile.');
        }

    } catch (error) {
        console.error('Fetch operation mein dikkat:', error);
        showError('Oops! Kuch गड़बड़ ho gayi. Address check karein ya baad mein try karein.');
    } finally {
        showLoader(false);
    }
}

function analyzeData(transactions) {
    const totalTrx = transactions.length;

    const trxByDay = {};
    transactions.forEach(tx => {
        const date = new Date(tx.block_timestamp).toLocaleDateString('en-CA');
        if (!trxByDay[date]) {
            trxByDay[date] = 0;
        }
        trxByDay[date]++;
    });

    let maxTrxDay = 0;
    let mostActiveDay = 'N/A';
    for (const day in trxByDay) {
        if (trxByDay[day] > maxTrxDay) {
            maxTrxDay = trxByDay[day];
            mostActiveDay = day;
        }
    }
    
    const { title, score, summary } = analyzeBoyBehavior(totalTrx, maxTrxDay);

    document.getElementById('totalTrx').textContent = totalTrx;
    document.getElementById('maxTrxDay').textContent = maxTrxDay;
    document.getElementById('mostActiveDay').textContent = mostActiveDay;
    document.getElementById('analysis-title').textContent = `Aapka Behavior Hai... ${title}`;
    document.getElementById('behaviorScore').textContent = `${score}/100`;
    document.getElementById('summaryText').textContent = summary;
    
    showResults(true);
}

function analyzeBoyBehavior(totalTrx, maxTrxDay) {
    let score = 0;
    let title = '';
    let summary = '';

    if (totalTrx > 100) score += 40;
    else if (totalTrx > 50) score += 20;
    else if (totalTrx > 10) score += 10;

    if (maxTrxDay > 20) score += 50;
    else if (maxTrxDay > 10) score += 30;
    else if (maxTrxDay > 5) score += 15;

    score = Math.min(score, 100);

    if (score >= 80) {
        title = "Absolute Chad Trader! 😎";
        summary = "Aap market mein ekdum active hain! High volume, high frequency, aapka portfolio hamesha move karta rehta hai. Risk lene se darte nahi, asli player!";
    } else if (score >= 50) {
        title = "Pro Degenerate 💪";
        summary = "Aap transactions karne mein kaafi active hain. Market trends par nazar rakhte hain aur mauke ka fayda uthate hain. Keep it up!";
    } else if (score >= 20) {
        title = "Casual Hodler 🚶‍♂️";
        summary = "Aap market mein hain, but carefully chalte hain. Zyadatar long-term holds karte hain aur zaroorat padne par hi transaction karte hain.";
    } else {
        title = "Sleeping Giant 😴";
        summary = "Aapka wallet shaant hai. Shayad aap long term vision rakhte hain ya abhi market se door hain. Shanti bhi ek strategy hai!";
    }

    return { title, score, summary };
}
