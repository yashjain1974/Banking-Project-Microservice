import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Import RouterLink

@Component({
  selector: 'app-banking-features',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="banking-features-container">
  <h2>Full Banking Features</h2>
  <p>Welcome to the core banking functionalities!</p>
  <p>Here you can manage your accounts, make transactions, apply for loans, and more.</p>
  
  <div class="feature-links">
    <a routerLink="/accounts" class="feature-button">Manage Accounts</a> <!-- Updated routerLink -->
    <a routerLink="/transactions" class="feature-button">Make Transactions</a>
    <a routerLink="/loans" class="feature-button">Apply for Loans</a>
    <a routerLink="/cards" class="feature-button">Manage Cards</a>
  </div>

  <button routerLink="/dashboard" class="back-button">Back to Dashboard</button>
</div>
  `,
  styles: [`
    .banking-features-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px;
      font-family: Arial, sans-serif;
      background-color: #e9f5ff; /* Light blue background */
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
      margin: 40px auto;
      max-width: 900px;
      text-align: center;
    }
    h2 {
      color: #0056b3;
      margin-bottom: 20px;
      font-size: 2.2em;
    }
    p {
      font-size: 1.1em;
      color: #333;
      margin-bottom: 25px;
    }
    .feature-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      margin-top: 30px;
      margin-bottom: 40px;
    }
    .feature-button {
      background-color: #007bff;
      color: #fff;
      padding: 15px 25px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 1.1em;
      font-weight: bold;
      transition: background-color 0.3s ease, transform 0.2s ease;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .feature-button:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
    }
    .back-button {
      background-color: #6c757d;
      color: #fff;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      margin-top: 30px;
    }
    .back-button:hover {
      background-color: #5a6268;
    }
  `]
})
export class BankingFeaturesComponent {

}
