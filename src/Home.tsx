/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/img-redundant-alt */
import { useEffect, useState } from "react";
import styled from "styled-components";
import Countdown from "react-countdown";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import * as anchor from "@project-serum/anchor";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
} from "./candy-machine";

const ConnectButton = styled(WalletDialogButton)`
  width: 100%;
  text-alignt: center;

  .MuiButton-label {
    justify-content: center;
  }
`;

const CounterText = styled.span``; // add your styles here

const MintContainer = styled.div``; // add your styles here

const MintButton = styled(Button)``; // add your styles here

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}

const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [itemsAvailable, setItemsAvailable] = useState(0);
  // const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [startDate, setStartDate] = useState(new Date(props.startDate));

  const wallet = useAnchorWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const refreshCandyMachineState = () => {
    (async () => {
      if (!wallet) return;

      const {
        candyMachine,
        goLiveDate,
        itemsAvailable,
        itemsRemaining,
      } = await getCandyMachineState(
        wallet as anchor.Wallet,
        props.candyMachineId,
        props.connection
      );

      setItemsAvailable(itemsAvailable);
      setItemsRemaining(itemsRemaining);
      // setItemsRedeemed(itemsRedeemed);

      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  };

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet && candyMachine?.program) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
      refreshCandyMachineState();
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(refreshCandyMachineState, [
    wallet,
    props.candyMachineId,
    props.connection,
  ]);

  return (
    <main
      className="py-4 artboard bg-base-200 flex flex-col items-center"
      style={{ minHeight: "100vh", overflow: "auto" }}
    >
      <div>
        <ul className="menu items-stretch px-3 shadow-lg bg-base-100 horizontal rounded-box mt-12">
          <li className="bordered">
            <a>Mint</a>
          </li>
          <li>
            <a>Collections</a>
          </li>
          <li>
            <a>Game</a>
          </li>
          <li>
            <a>Leaderboard</a>
          </li>
          <li>
            <a>Git</a>
          </li>
        </ul>
      </div>

      <div className="prose text-center">
        <h1 className="mt-12 block">Infomorphs Set 1</h1>

        <div className="flex flex-col justify-center items-center mb-5">
          <div className="filter drop-shadow-xl">
            <div
              style={{ maxHeight: 600, overflow: "hidden" }}
              className="rounded-box"
            >
              <div className="carousel">
                <div className="carousel-item" id="item1">
                  <img
                    className="m-0"
                    src="carousel/1.png"
                    alt="Carousel Image"
                  />
                </div>
                <div className="carousel-item" id="item2">
                  <img
                    className="m-0"
                    src="carousel/2.png"
                    alt="Carousel Image"
                  />
                </div>
                <div className="carousel-item" id="item3">
                  <img
                    className="m-0"
                    src="carousel/3.png"
                    alt="Carousel Image"
                  />
                </div>
                <div className="carousel-item" id="item4">
                  <img
                    className="m-0"
                    src="carousel/4.png"
                    alt="Carousel Image"
                  />
                </div>
                <div className="carousel-item" id="item5">
                  <img
                    className="m-0"
                    src="carousel/5.png"
                    alt="Carousel Image"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center w-full py-4 space-x-2 mb-3">
            <a href="/#item1" className="btn btn-xs btn-circle">
              1
            </a>
            <a href="/#item2" className="btn btn-xs btn-circle">
              2
            </a>
            <a href="/#item3" className="btn btn-xs btn-circle">
              3
            </a>
            <a href="/#item4" className="btn btn-xs btn-circle">
              4
            </a>
          </div>

        <div className="card bg-primary">
          <div className="card-body">
            {wallet && (
              <div className="card bg-base-200">
                <div className="card-body p-3">
                  {" "}
                  {wallet && (
                    <>
                    <div className="my-2">
                      {shortenAddress(wallet.publicKey.toBase58() || "")} : {(balance || 0).toLocaleString()} SOL
                    </div>
                    <div  className="my-2"> Available: {itemsAvailable} / {itemsRemaining}</div>
                    </>
                  )}
                  <MintContainer>
                    {!wallet ? (
                      <ConnectButton>Connect Wallet</ConnectButton>
                    ) : (
                      <MintButton
                        disabled={isSoldOut || isMinting || !isActive}
                        onClick={onMint}
                        variant="contained"
                      >
                        {isSoldOut ? (
                          "SOLD OUT"
                        ) : isActive ? (
                          isMinting ? (
                            <CircularProgress />
                          ) : (
                            "MINT"
                          )
                        ) : (
                          <Countdown
                            date={startDate}
                            onMount={({ completed }) =>
                              completed && setIsActive(true)
                            }
                            onComplete={() => setIsActive(true)}
                            renderer={renderCounter}
                          />
                        )}
                      </MintButton>
                    )}
                  </MintContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </main>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      {hours + (days || 0) * 24} hours, {minutes} minutes, {seconds} seconds
    </CounterText>
  );
};

export default Home;
