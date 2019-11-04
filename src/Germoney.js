import React from "react";
import logo from "./logo.png";
import { newContextComponents } from "@drizzle/react-components";
const { AccountData, ContractData } = newContextComponents;

export default class Germoney extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      priceInEth: 0
    };

    this.buyGermoney = this.buyGermoney.bind(this);
  }

  async componentDidMount() {
    const priceInWei = await this.props.drizzle.contracts.Germoney.methods
      .price()
      .call();

    const supplyWithDecimals = await this.props.drizzle.contracts.Germoney.methods
      .totalSupply()
      .call();

    const balance = await this.props.drizzle.contracts.Germoney.methods
      .balanceOf(this.props.drizzleState.accounts[0])
      .call();

    const realBalance = balance / 100;
    const totalSupply = supplyWithDecimals / 100;
    const priceInEth =
      this.props.drizzle.web3.utils.fromWei(priceInWei, "ether") * 100;

    this.setState({
      priceInEth: priceInEth,
      totalSupply: totalSupply,
      balance: realBalance
    });
  }

  async buyGermoney(event) {
    event.preventDefault();
    const amountAsText = new FormData(event.target).get("amount");
    const cleaned = amountAsText.replace(",", ".");
    const desiredAmount = parseFloat(cleaned);
    if (Number.isNaN(desiredAmount)) {
      alert("invalid amount: " + amountAsText);
      return;
    }
    if (desiredAmount < 0.01) {
      alert("please buy at least 1 Pfennig");
      return;
    }
    const etherToPay = desiredAmount * this.state.priceInEth;
    const weiToPay = this.props.drizzle.web3.utils.toWei(
      etherToPay + "",
      "ether"
    );
    await this.props.drizzle.contracts.Germoney.methods.buy.cacheSend({
      value: weiToPay
    });
  }

  render() {
    const { web3 } = window;

    const sectionWithWeb3 = (
      <div>
        <div className="section">
          <h2>Buy Germoney</h2>
          <p>Go ahead and by this awesome currency.</p>
          <form onSubmit={this.buyGermoney}>
            <input
              name="amount"
              id="amount"
              type="text"
              placeholder="Amount"
            ></input>
            <input type="submit"></input>
          </form>
        </div>
        <div className="section">
          <h2>Your account</h2>
          <AccountData
            drizzle={this.props.drizzle}
            drizzleState={this.props.drizzleState}
            accountIndex={0}
            units="ether"
            precision={3}
          />
          <p>{this.state.balance + " GER"}</p>
        </div>
      </div>
    );

    const sectionWithoutWeb3 = (
      <div className="section">
        <h2>web3 is missing</h2>
        {"Please use a web3 enabled browser or add-on to buy Germoney"}
        <br></br>
        <br></br>
        <a href="https://metamask.io/">Meta Mask (add-on)</a>
        <br></br>
        <a href="https://status.im/">Status.im (mobile)</a>
        <br></br>
        <a href="https://trustwallet.com/">Trust wallet (mobile)</a>
      </div>
    );

    return (
      <div className="App">
        <div>
          <img src={logo} alt="drizzle-logo" />
          <h1>Germoney</h1>
          <p>
            Very simplistic interface to buy the most important token in the
            Ethereum ecosystem.
          </p>
        </div>
        {web3 ? sectionWithWeb3 : sectionWithoutWeb3}
        <div className="section">
          <h2>Germoney in numbers</h2>
          <p>
            <strong>Total Supply: </strong>
            {this.state.totalSupply + " "}
            <ContractData
              drizzle={this.props.drizzle}
              drizzleState={this.props.drizzleState}
              contract="Germoney"
              method="symbol"
              hideIndicator
            />
          </p>
          <strong>Price: </strong>
          {this.state.priceInEth + " ETH/GER"}
        </div>
      </div>
    );
  }
}
