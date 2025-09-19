// Gold Price Calculator JS with modern enhancements
const defaultCharges = {
    '92': 1200,
    '89': 1200,
    '90.5': 1200,
    '91': 1200,
    '92b': 1200 // 92% (No GST)
};

// Store data in memory instead of localStorage for Claude.ai compatibility
let charges = {...defaultCharges};

function getCharges() {
    return charges;
}

function saveCharges(newCharges) {
    charges = {...newCharges};
}

function formatINR(num) {
    if (Number.isInteger(num)) {
        return '₹' + num.toLocaleString('en-IN', {maximumFractionDigits: 0});
    }
    return '₹' + num.toLocaleString('en-IN', {maximumFractionDigits: 2});
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        ${type === 'success' ? 'background: #2E8B57;' : 'background: #DC143C;'}
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Check if user is logged in
function checkLogin() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', function() {
    // Check login status when page loads
    checkLogin();

    const goldForm = document.getElementById('goldForm');
    const resultsDiv = document.getElementById('results');
    const configBtn = document.getElementById('configBtn');
    const configModal = document.getElementById('configModal');
    const closeModal = document.querySelector('.close');
    const configForm = document.getElementById('configForm');

    // Add loading animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    function loadChargesToModal() {
        const currentCharges = getCharges();
        document.getElementById('charge92').value = currentCharges['92'];
        document.getElementById('charge89').value = currentCharges['89'];
        document.getElementById('charge905').value = currentCharges['90.5'];
        document.getElementById('charge91').value = currentCharges['91'];
        document.getElementById('charge92b').value = currentCharges['92b'];
    }

    configBtn.onclick = function() {
        loadChargesToModal();
        configModal.style.display = 'block';
    };

    closeModal.onclick = function() {
        configModal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == configModal) {
            configModal.style.display = 'none';
        }
    };

    configForm.onsubmit = function(e) {
        e.preventDefault();
        const newCharges = {
            '92': Number(document.getElementById('charge92').value),
            '89': Number(document.getElementById('charge89').value),
            '90.5': Number(document.getElementById('charge905').value),
            '91': Number(document.getElementById('charge91').value),
            '92b': Number(document.getElementById('charge92b').value)
        };
        saveCharges(newCharges);
        configModal.style.display = 'none';
        showNotification('Labour charges saved successfully!');
    };

    goldForm.onsubmit = function(e) {
        e.preventDefault();

        // Add loading effect
        const submitBtn = goldForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        submitBtn.disabled = true;

        setTimeout(() => {
            const goldRate = Number(document.getElementById('goldRate').value);
            const weight = Number(document.getElementById('weight').value);
            const goldType = document.getElementById('goldType').value;
            const currentCharges = getCharges();

            let baseRate = goldRate;
            let percentList = [
                { label: '92% Gold', percent: 0.92, chargeKey: '92', icon: 'fas fa-star' },
                { label: '91% Gold', percent: 0.91, chargeKey: '91', icon: 'fas fa-star' },
                { label: '90.5% Gold', percent: 0.905, chargeKey: '90.5', icon: 'fas fa-star-half-alt' },
                { label: '89% Gold', percent: 0.89, chargeKey: '89', icon: 'fas fa-star-half-alt' },
                { label: '92% Gold (No GST)', percent: 0.92, chargeKey: '92b', noGST: true, icon: 'fas fa-certificate' }
            ];

            let html = `
                <div class="results-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th><i class="fas fa-tag"></i> Type</th>
                                <th><i class="fas fa-coins"></i> Gold Value</th>
                                <th><i class="fas fa-tools"></i> Labour Charge</th>
                                <th><i class="fas fa-receipt"></i> GST (3%)</th>
                                <th><i class="fas fa-calculator"></i> Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            percentList.forEach(row => {
                let rate = baseRate;
                let percent = row.percent;
                let label = row.label;
                let charge = currentCharges[row.chargeKey] || 0;
                let gst = 0;
                let goldValue = 0;
                let total = 0;

                if (goldType === 'old') {
                    rate = baseRate - 2000;
                    percent = 0.90;
                    label = '<i class="fas fa-recycle"></i> 90% (Old Gold)';
                    charge = currentCharges['90.5'] || 0;
                } else {
                    label = `<i class="${row.icon}"></i> ${label}`;
                }

                goldValue = (rate * percent * weight) / 10;
                let labourCharge = charge * weight;
                total = goldValue + labourCharge;

                if (!row.noGST) {
                    gst = total * 0.03;
                    total += gst;
                }

                const roundedTotal = Math.round(total);

                html += `
                    <tr>
                        <td>${label}</td>
                        <td>${formatINR(goldValue)}</td>
                        <td>${formatINR(labourCharge)}</td>
                        <td>${row.noGST ? '<span style="color: #999;">No GST</span>' : formatINR(gst)}</td>
                        <td class="price-highlight">${formatINR(roundedTotal)}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            resultsDiv.innerHTML = html;

            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Smooth scroll to results
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        }, 500); // Small delay for better UX
    };
});