
function calc() {
  const price = parseFloat(document.getElementById('homePrice').value) || 0;
  const downPct = (parseFloat(document.getElementById('downPaymentPct').value) || 0) / 100;
  const rate = (parseFloat(document.getElementById('mortgageRate').value) || 0) / 100 / 12;
  const rent = parseFloat(document.getElementById('monthlyRent').value) || 0;

  const downPayment = price * downPct;
  const loan = price - downPayment;

  // 30-year fixed P&I
  const n = 360;
  const monthlyPI = (loan * (rate * Math.pow(1 + rate, n))) / (Math.pow(1 + rate, n) - 1);
  const monthlyTaxes = (price * 0.012) / 12; // 1.2% US avg property tax
  const monthlyInsurance = 120;
  const monthlyMaintenance = (price * 0.01) / 12; // 1% annual maintenance rule
  const totalOwnerMonthly = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyMaintenance;

  // Closing costs
  const buyClosing = price * 0.03; // 3% buyer closing
  const initialOutlay = downPayment + buyClosing;

  // Yearly simulations
  let breakEven = "Year 5+";
  let buyerWealth10 = 0;
  let homeVal = price;
  let currentLoan = loan;
  let renterInvestments = initialOutlay;

  for (let yr = 1; yr <= 10; yr++) {
    // 3.5% annual home appreciation
    homeVal *= 1.035;

    // Principal paydown over 12 months
    for (let m = 0; m < 12; m++) {
      let int = currentLoan * rate;
      let prin = monthlyPI - int;
      currentLoan -= prin;
    }

    // Buyer equity (minus 6% selling costs)
    let buyerEquity = homeVal * 0.94 - currentLoan;

    // Renter invests down payment in market at 7% return
    renterInvestments *= 1.07;
    // Renter saves/spends difference
    let rentCostYr = rent * Math.pow(1.03, yr - 1) * 12;
    let ownerCostYr = totalOwnerMonthly * 12;
    let diff = ownerCostYr - rentCostYr;
    if (diff > 0) {
      renterInvestments += diff * 0.9; // Renter invests the monthly savings
    }

    if (buyerEquity > renterInvestments && breakEven === "Year 5+") {
      breakEven = `Year ${yr}`;
    }
    if (yr === 10) {
      buyerWealth10 = buyerEquity;
    }
  }

  document.getElementById('breakEvenYr').innerText = breakEven;
  document.getElementById('initialOutlay').innerText = '$' + Math.round(initialOutlay).toLocaleString();
  document.getElementById('ownerPITI').innerText = '$' + Math.round(totalOwnerMonthly).toLocaleString() + '/mo';
  document.getElementById('buyerNetWorth').innerText = '$' + Math.round(buyerWealth10).toLocaleString();

  document.getElementById('breakEvenText').innerHTML = 
    `At <strong>$${Math.round(totalOwnerMonthly).toLocaleString()}/mo</strong> in total ownership costs (Mortgage + Tax + Insurance + Maintenance) vs <strong>$${rent}/mo</strong> rent, buying beats renting around <strong>${breakEven}</strong>. If you plan to stay in the home for more than 5 years, buying builds substantial equity.`;
}

['homePrice', 'downPaymentPct', 'mortgageRate', 'monthlyRent'].forEach(id => {
  document.getElementById(id).addEventListener('input', calc);
});

calc();
