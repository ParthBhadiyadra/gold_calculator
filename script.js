// Gold Price Calculator JS

const defaultCharges = {
    '92': 1200,
    '89': 1200,
    '90.5': 1200,
    '91': 1200,
    '92b': 1200 // 92% (No GST)
};

const MAKE_KEY = 'goldMakeName';

function getCharges() {
    let charges = localStorage.getItem('goldLablerCharges');
    if (charges) {
        try {
            return JSON.parse(charges);
        } catch {
            return {...defaultCharges};
        }
    }
    return {...defaultCharges};
}

function saveCharges(charges) {
    localStorage.setItem('goldLablerCharges', JSON.stringify(charges));
}

function formatINR(num) {
    return '₹' + num.toLocaleString('en-IN', {maximumFractionDigits: 2});
}

document.addEventListener('DOMContentLoaded', function() {
    const goldForm = document.getElementById('goldForm');
    const resultsDiv = document.getElementById('results');
    const configBtn = document.getElementById('configBtn');
    const configModal = document.getElementById('configModal');
    const closeModal = document.querySelector('.close');
    const configForm = document.getElementById('configForm');
    const makeInput = document.getElementById('make');
    const configMakeInput = document.getElementById('configMake');

    function loadChargesToModal() {
        const charges = getCharges();
        document.getElementById('charge92').value = charges['92'];
        document.getElementById('charge89').value = charges['89'];
        document.getElementById('charge905').value = charges['90.5'];
        document.getElementById('charge91').value = charges['91'];
        document.getElementById('charge92b').value = charges['92b'];
    // load make
    const savedMake = localStorage.getItem(MAKE_KEY) || 'Milan Jewellers';
    configMakeInput.value = savedMake;
    if (makeInput) makeInput.value = savedMake;
    }

    configBtn.onclick = function() {
        loadChargesToModal();
        configModal.style.display = 'block';
    };
    closeModal.onclick = function() {
        configModal.style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target == configModal) configModal.style.display = 'none';
    };

    configForm.onsubmit = function(e) {
        e.preventDefault();
        const charges = {
            '92': Number(document.getElementById('charge92').value),
            '89': Number(document.getElementById('charge89').value),
            '90.5': Number(document.getElementById('charge905').value),
            '91': Number(document.getElementById('charge91').value),
            '92b': Number(document.getElementById('charge92b').value)
        };
    const makeVal = String(document.getElementById('configMake').value || 'Milan Jewellers');
    localStorage.setItem(MAKE_KEY, makeVal);
    if (makeInput) makeInput.value = makeVal;
        saveCharges(charges);
        configModal.style.display = 'none';
        alert('Labler charges saved!');
    };

    goldForm.onsubmit = function(e) {
        e.preventDefault();
    // save make from form input
    if (makeInput) localStorage.setItem(MAKE_KEY, String(makeInput.value || 'Milan Jewellers'));
        const goldRate = Number(document.getElementById('goldRate').value);
        const weight = Number(document.getElementById('weight').value);
        const goldType = document.getElementById('goldType').value;
        const charges = getCharges();
        let baseRate = goldRate;
        let percentList = [
            { label: '92%', percent: 0.92, chargeKey: '92' },
            { label: '89%', percent: 0.89, chargeKey: '89' },
            { label: '90.5%', percent: 0.905, chargeKey: '90.5' },
            { label: '91%', percent: 0.91, chargeKey: '91' },
            { label: '92% (No GST)', percent: 0.92, chargeKey: '92b', noGST: true }
        ];

    const makeName = localStorage.getItem(MAKE_KEY) || 'Milan Jewellers';
    let html = `<div class="results-header"> <strong>Make:</strong> ${makeName}</div>`;
    html += '<div class="results-wrapper"><table>';
    html += '<tr><th>Type</th><th>Gold Value</th><th>Labler Charge</th><th>GST</th><th>Total</th></tr>';

        percentList.forEach(row => {
            let rate = baseRate;
            let percent = row.percent;
            let label = row.label;
            let charge = charges[row.chargeKey] || 0;
            let gst = 0;
            let goldValue = 0;
            let total = 0;

            if (goldType === 'old') {
                rate = baseRate - 2000;
                percent = 0.90;
                label = '90% (Old Gold)';
                charge = charges['90.5'] || 0;
            }

            goldValue = (rate * percent * weight) / 10;
            let lablerCharge = (charge * weight) / 10;
            total = goldValue + lablerCharge;
            if (!row.noGST) {
                gst = total * 0.03;
                total += gst;
            }

            html += `<tr>
                        <td>${label}</td>
                        <td>${formatINR(goldValue)}</td>
                        <td>${formatINR(lablerCharge)}</td>
                        <td>${row.noGST ? '-' : formatINR(gst)}</td>
                        <td>${formatINR(total)}</td>
                    </tr>`;
        });

        html += '</table></div>';
        resultsDiv.innerHTML = html;
    };
});
