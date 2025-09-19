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
let calculationHistory = [];

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

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(tabId + '-tab').classList.add('active');

            // Load configuration values when opening config tab
            if (tabId === 'configuration') {
                loadChargesToConfigTab();
            }

            // Load history when opening history tab
            if (tabId === 'history') {
                displayHistory();
            }
        });
    });
}

// Load charges to configuration tab
function loadChargesToConfigTab() {
    const currentCharges = getCharges();
    document.getElementById('charge92').value = currentCharges['92'];
    document.getElementById('charge89').value = currentCharges['89'];
    document.getElementById('charge905').value = currentCharges['90.5'];
    document.getElementById('charge91').value = currentCharges['91'];
    document.getElementById('charge92b').value = currentCharges['92b'];
}

// Reset charges to default
function resetCharges() {
    charges = {...defaultCharges};
    loadChargesToConfigTab();
    showNotification('Charges reset to default values!');
}

// Add calculation to history
function addToHistory(goldRate, weight, goldType, results) {
    const timestamp = new Date().toLocaleString();
    const historyItem = {
        timestamp,
        goldRate,
        weight,
        goldType,
        results
    };

    calculationHistory.unshift(historyItem); // Add to beginning

    // Keep only last 20 calculations
    if (calculationHistory.length > 20) {
        calculationHistory = calculationHistory.slice(0, 20);
    }
}

// Display history
function displayHistory() {
    const historyList = document.getElementById('history-list');

    if (calculationHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">No calculations yet. Start calculating to see your history!</p>';
        return;
    }

    let html = '';
    calculationHistory.forEach((item, index) => {
        const bestResult = item.results.reduce((min, current) =>
            current.total < min.total ? current : min
        );

        html += `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-details">
                        <strong>Gold Rate:</strong> ${formatINR(item.goldRate)}/10g |
                        <strong>Weight:</strong> ${item.weight}g |
                        <strong>Type:</strong> ${item.goldType === 'new' ? 'New Gold' : 'Old Gold'}
                    </div>
                    <div class="history-time">${item.timestamp}</div>
                </div>
                <div class="history-result">
                    <strong>Best Price:</strong> ${formatINR(bestResult.total)} <small>(${bestResult.label})</small>
                </div>
            </div>
        `;
    });

    historyList.innerHTML = html;
}

// Create mobile-friendly table
function createMobileTable(results) {
    let html = '<div class="mobile-table-card">';

    results.forEach(row => {
        html += `
            <div class="calculation-card">
                <div class="card-header">
                    <i class="${row.icon}"></i>
                    <h3>${row.label}</h3>
                </div>
                <div class="card-details">
                    <div class="detail-item">
                        <span class="detail-label">Gold Value:</span>
                        <span class="detail-value">${formatINR(row.goldValue)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Labour:</span>
                        <span class="detail-value">${formatINR(row.labourCharge)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">GST (3%):</span>
                        <span class="detail-value">${row.noGST ? 'No GST' : formatINR(row.gst)}</span>
                    </div>
                </div>
                <div class="total-price">
                    <div class="price-label">Total Price</div>
                    <div class="price-value">${formatINR(row.total)}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

document.addEventListener('DOMContentLoaded', function() {
    // Check login status when page loads
    checkLogin();

    // Initialize tabs
    initializeTabs();

    const goldForm = document.getElementById('goldForm');
    const resultsDiv = document.getElementById('results');
    const configForm = document.getElementById('configForm');
    const resetBtn = document.getElementById('resetBtn');

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

    // Reset button functionality
    if (resetBtn) {
        resetBtn.onclick = function() {
            resetCharges();
        };
    }

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

            const results = [];

            percentList.forEach(row => {
                let rate = baseRate;
                let percent = row.percent;
                let label = row.label;
                let charge = currentCharges[row.chargeKey] || 0;
                let gst = 0;
                let goldValue = 0;
                let total = 0;
                let icon = row.icon;

                if (goldType === 'old') {
                    rate = baseRate - 2000;
                    percent = 0.90;
                    label = '90% (Old Gold)';
                    charge = currentCharges['90.5'] || 0;
                    icon = 'fas fa-recycle';
                }

                goldValue = (rate * percent * weight) / 10;
                let labourCharge = charge * weight;
                total = goldValue + labourCharge;

                if (!row.noGST) {
                    gst = total * 0.03;
                    total += gst;
                }

                const roundedTotal = Math.round(total);

                results.push({
                    label,
                    goldValue,
                    labourCharge,
                    gst,
                    total: roundedTotal,
                    noGST: row.noGST,
                    icon
                });
            });

            // Add to history
            addToHistory(goldRate, weight, goldType, results);

            // Create desktop table
            let desktopHtml = `
                <div class="results-wrapper">
                    <div class="table-container desktop-table">
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

            results.forEach(row => {
                desktopHtml += `
                    <tr>
                        <td><i class="${row.icon}"></i> ${row.label}</td>
                        <td>${formatINR(row.goldValue)}</td>
                        <td>${formatINR(row.labourCharge)}</td>
                        <td>${row.noGST ? '<span style="color: #999;">No GST</span>' : formatINR(row.gst)}</td>
                        <td class="price-highlight">${formatINR(row.total)}</td>
                    </tr>
                `;
            });

            desktopHtml += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // Create mobile cards
            const mobileHtml = createMobileTable(results);

            const html = desktopHtml + mobileHtml;

            resultsDiv.innerHTML = html;

            // Show best price notification
            const bestPrice = results.reduce((min, current) =>
                current.total < min.total ? current : min
            );
            showNotification(`Best price: ${formatINR(bestPrice.total)} (${bestPrice.label})`, 'success');

            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Smooth scroll to results
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        }, 500); // Small delay for better UX
    };
});