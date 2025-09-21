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

// Default percentage charges
const defaultPercentages = {
    '92': 15,
    '89': 15,
    '90.5': 15,
    '91': 15,
    '92b': 15
};

let percentages = {...defaultPercentages};
let isPercentageBased = false; // false = fixed, true = percentage

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
    const currentPercentages = getPercentages();

    // Load fixed charges
    document.getElementById('charge92').value = currentCharges['92'];
    document.getElementById('charge89').value = currentCharges['89'];
    document.getElementById('charge905').value = currentCharges['90.5'];
    document.getElementById('charge91').value = currentCharges['91'];
    document.getElementById('charge92b').value = currentCharges['92b'];

    // Load percentage charges
    document.getElementById('percent92').value = currentPercentages['92'];
    document.getElementById('percent89').value = currentPercentages['89'];
    document.getElementById('percent905').value = currentPercentages['90.5'];
    document.getElementById('percent91').value = currentPercentages['91'];
    document.getElementById('percent92b').value = currentPercentages['92b'];

    // Set toggle state
    document.getElementById('chargeTypeToggle').checked = isPercentageBased;
    toggleChargeType();
}

// Get percentage charges
function getPercentages() {
    return percentages;
}

// Save percentage charges
function savePercentages(newPercentages) {
    percentages = {...newPercentages};
}

// Toggle between fixed and percentage charges
function toggleChargeType() {
    const toggle = document.getElementById('chargeTypeToggle');
    const fixedSection = document.getElementById('fixed-charges');
    const percentageSection = document.getElementById('percentage-charges');

    isPercentageBased = toggle.checked;

    if (isPercentageBased) {
        fixedSection.style.display = 'none';
        percentageSection.style.display = 'block';
        percentageSection.classList.add('active');
        fixedSection.classList.remove('active');
    } else {
        fixedSection.style.display = 'block';
        percentageSection.style.display = 'none';
        fixedSection.classList.add('active');
        percentageSection.classList.remove('active');
    }
}

// Calculate labour charge based on type
function calculateLabourCharge(goldValue, weight, chargeKey) {
    if (isPercentageBased) {
        const percentage = percentages[chargeKey] || 0;
        return (goldValue * percentage) / 100;
    } else {
        const fixedCharge = charges[chargeKey] || 0;
        return fixedCharge * weight;
    }
}

// Reset charges to default
function resetCharges() {
    charges = {...defaultCharges};
    percentages = {...defaultPercentages};
    isPercentageBased = false;
    loadChargesToConfigTab();
    showNotification('All charges reset to default values!');
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
    const chargeTypeToggle = document.getElementById('chargeTypeToggle');

    // Initialize charge type toggle
    if (chargeTypeToggle) {
        chargeTypeToggle.addEventListener('change', toggleChargeType);
        // Set initial state
        toggleChargeType();
    }

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

        // Save fixed charges
        const newCharges = {
            '92': Number(document.getElementById('charge92').value),
            '89': Number(document.getElementById('charge89').value),
            '90.5': Number(document.getElementById('charge905').value),
            '91': Number(document.getElementById('charge91').value),
            '92b': Number(document.getElementById('charge92b').value)
        };
        saveCharges(newCharges);

        // Save percentage charges
        const newPercentages = {
            '92': Number(document.getElementById('percent92').value),
            '89': Number(document.getElementById('percent89').value),
            '90.5': Number(document.getElementById('percent905').value),
            '91': Number(document.getElementById('percent91').value),
            '92b': Number(document.getElementById('percent92b').value)
        };
        savePercentages(newPercentages);

        const chargeType = isPercentageBased ? 'percentage' : 'fixed';
        showNotification(`Labour charges (${chargeType}) saved successfully!`);
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
                    row.chargeKey = '90.5'; // Use 90.5% rates for old gold
                    icon = 'fas fa-recycle';
                }

                goldValue = (rate * percent * weight) / 10;
                let labourCharge = calculateLabourCharge(goldValue, weight, row.chargeKey);
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

            // Add Download PDF button
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'btn-primary';
            downloadBtn.style.marginTop = '20px';
            downloadBtn.textContent = 'Download Estimation (PDF)';
            downloadBtn.onclick = function() {
                // Programmatically build a clean table from 'results' (works reliably on mobile)
                const goldRateVal = Number(document.getElementById('goldRate').value);
                const weightVal = Number(document.getElementById('weight').value);
                const goldTypeVal = document.getElementById('goldType').value === 'new' ? 'New Gold' : 'Old Gold';

                let tableHtml = `
                    <div style="text-align:center;margin-bottom:8px;">
                        <h2 style="margin:0;">Gold Price Estimation</h2>
                        <div style="font-size:0.95rem;color:#333;margin-top:6px;">Rate: ${formatINR(goldRateVal)}/10g &nbsp;|&nbsp; Weight: ${weightVal}g &nbsp;|&nbsp; Type: ${goldTypeVal}</div>
                    </div>
                    <table style="width:100%;border-collapse:collapse;margin-top:12px;font-family:inherit;">
                        <thead>
                            <tr style="background:#f7f7f7;">
                                <th style="text-align:left;padding:8px;border:1px solid #eaeaea;">Type</th>
                                <th style="text-align:right;padding:8px;border:1px solid #eaeaea;">Gold Value</th>
                                <th style="text-align:right;padding:8px;border:1px solid #eaeaea;">Labour Charge</th>
                                <th style="text-align:right;padding:8px;border:1px solid #eaeaea;">GST (3%)</th>
                                <th style="text-align:right;padding:8px;border:1px solid #eaeaea;">Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                results.forEach(row => {
                    tableHtml += `
                        <tr>
                            <td style="padding:8px;border:1px solid #eaeaea;">${row.label}</td>
                            <td style="padding:8px;border:1px solid #eaeaea;text-align:right;">${formatINR(row.goldValue)}</td>
                            <td style="padding:8px;border:1px solid #eaeaea;text-align:right;">${formatINR(row.labourCharge)}</td>
                            <td style="padding:8px;border:1px solid #eaeaea;text-align:right;">${row.noGST ? 'No GST' : formatINR(row.gst)}</td>
                            <td style="padding:8px;border:1px solid #eaeaea;text-align:right;font-weight:700;">${formatINR(row.total)}</td>
                        </tr>
                    `;
                });

                tableHtml += `</tbody></table>`;

                const tableContainer = document.createElement('div');
                tableContainer.style.padding = '10px 14px';
                tableContainer.innerHTML = tableHtml;

                const opt = {
                    margin:       10,
                    filename:     `estimation_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.pdf`,
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true },
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                // Try to output blob and handle mobile vs desktop differently for better compatibility
                if (typeof html2pdf === 'function') {
                    try {
                        const promise = html2pdf().set(opt).from(tableContainer).output('blob');
                        if (promise && typeof promise.then === 'function') {
                            promise.then(function(blob) {
                                const filename = opt.filename;
                                const url = URL.createObjectURL(blob);
                                // Try programmatic download first
                                try {
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = filename;
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    setTimeout(() => URL.revokeObjectURL(url), 15000);
                                } catch (e) {
                                    // Fallback: open in new tab/window (useful on some mobile browsers)
                                    window.open(url, '_blank');
                                    setTimeout(() => URL.revokeObjectURL(url), 15000);
                                }
                            }).catch(function() {
                                // Fallback to save()
                                html2pdf().set(opt).from(tableContainer).save();
                            });
                        } else {
                            // Fallback: directly save
                            html2pdf().set(opt).from(tableContainer).save();
                        }
                    } catch (err) {
                        html2pdf().set(opt).from(tableContainer).save();
                    }
                } else {
                    showNotification('PDF export library not loaded', 'error');
                }
            };

            // Remove existing pdf button if any and append
            const existingPdfBtn = document.getElementById('download-pdf-btn');
            if (existingPdfBtn) existingPdfBtn.remove();
            downloadBtn.id = 'download-pdf-btn';
            resultsDiv.appendChild(downloadBtn);

            // Show best price notification
            const bestPrice = results.reduce((min, current) =>
                current.total < min.total ? current : min
            );
            const chargeMethod = isPercentageBased ? 'Percentage' : 'Fixed';
            showNotification(`Best price: ${formatINR(bestPrice.total)} (${bestPrice.label}) - ${chargeMethod} charges`, 'success');

            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Smooth scroll to results
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        }, 500); // Small delay for better UX
    };
});