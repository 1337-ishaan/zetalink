import styled from 'styled-components/macro';
import StyledInput from '../utils/StyledInput';
import Typography from '../utils/Typography';
import { useContext, useEffect, useState } from 'react';
import StyledButton from '../utils/StyledButton';
import { getBtcFees, transactBtc } from '../../utils/snap';
import Select from 'react-dropdown-select';
import axios from 'axios';
import { getChainIcon } from '../../constants/getChainIcon';
import { ReactComponent as GasIcon } from '../../assets/gas.svg';
import { ReactComponent as RedirectIcon } from '../../assets/redirect.svg';

import InfoBox from '../utils/InfoBox';
import FlexColumnWrapper from '../utils/wrappers/FlexColumnWrapper';
import FlexRowWrapper from '../utils/wrappers/FlexRowWrapper';
import { toast } from 'react-toastify';
import TooltipInfo from '../utils/TooltipInfo';
import { StoreContext } from '../../hooks/useStore';
import { ZETA_MAINNET_BLOCKPI_API_URL, ZETA_TESTNET_BLOCKPI_API_URL } from '../../constants/api';
import { satsToBtc } from '../../utils/satConverter';

const SendWrapper = styled.div`
  display: flex;
  border-radius: 12px;
  padding: 40px;
  overflow-y: auto;
  color: #fff;
  height: fit-content;
  flex-direction: column;
  gap: 24px;

  width: fit-content;
  background: ${(props) => props.theme.colors.background!.default};
  .inputs-wrapper {
    color: white;
    row-gap: 12px;
    width: 100%;
  }
  .dropdown-item {
    padding: 10px;
    outline: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${(props) => props.theme.colors.background!.default};
    .icon-symbol-wrapper {
      display: flex;
      align-items: center;
    }
    .dropdown-image {
      margin-right: 5px;
      width: 24px;
      height: 24px;
    }
  }
  .transfer-types-wrapper {
    column-gap: 24px;
  }
  .css-1uslfsx-DropDown {
    border: none !important;
  }
  .gas-wrapper {
    column-gap: 8px;
    justify-content: end;
    .icon {
      width: 16px;
    }
    .amount {
      font-size: 16px;
    }
  }

  .priority-wrapper {
    justify-content: space-evenly;
    border-radius: ${(props) => props.theme.borderRadius};
    border: 1px solid white;
    padding: 12px;
    width: 94%;
    margin: auto;
    column-gap: 8px;

    .priority-item {
      row-gap: 8px;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      width: 100%;
      padding: 4px 8px;
      border-radius: ${(props) => props.theme.borderRadius};

      &:hover {
        background: rgba(44, 43, 43, 0.892);
      }
      &.selected {
        background: rgba(54, 54, 54, 92);
      }
    }
    .vertical-divider {
      height: 50px;
      width: 1px;
      background-color: #ffffff4e;
    }
  }
  .custom-tooltip-wrapper {
    align-items: center;
    column-gap: 8px;

    .custom-memo-input {
      flex: 1;
    }
  }
  .max-utxo {
    justify-content: end;
    font-size: 14px;
    cursor: pointer;
    color: #6bf08c;
    font-weight: 600;
    &.red {
      color: #ff4a3d;
      cursor: disabled;
    }
  }
`;

interface SendProps {
  setIsSendModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Send = ({ setIsSendModalOpen }: SendProps): JSX.Element => {
  const [currentActive, setCurrentActive] = useState('zeta');
  const [ZRC20Assets, setZRC20Assets] = useState<any>();
  const [selectedZRC20, setSelectedZRC20] = useState<any>('');
  const [amount, setAmount] = useState<any>(0);
  const [recipientAddress, setRecipientAddress] = useState<any>('');
  const [isTrxProcessing, setIsTrxProcessing] = useState(false);
  const [customMemo, setCustomMemo] = useState('');
  const [zetaDepositFees, setZetaDepositFees] = useState<any>();
  const [depositFees, setDepositFees] = useState<any>();
  const { globalState, setGlobalState } = useContext(StoreContext);

  const sendTrx = async () => {
    setIsTrxProcessing(true);
    toast('Processing...', {
      hideProgressBar: false,
    });
    try {
      await transactBtc(
        recipientAddress ? recipientAddress : globalState?.evmAddress,
        selectedZRC20.zrc20_contract_address,
        +amount,
        customMemo,
        zetaDepositFees,
      );
    } catch (e: unknown) {
      toast(`Error: ${(e as Error).message}`, { hideProgressBar: false });
    } finally {
      setIsTrxProcessing(false);
      setGlobalState({ ...globalState, isTrxProcessed: true });
      setIsSendModalOpen(false);
    }
  };

  const getZrc20Assets = async () => {
    let assets = await axios.get(
      // TODO: make API_URL as constant
      `${globalState?.isMainnet ? ZETA_MAINNET_BLOCKPI_API_URL : ZETA_TESTNET_BLOCKPI_API_URL}/zeta-chain/fungible/foreign_coins`,
    );
    setZRC20Assets(assets.data.foreignCoins);
    return assets;
  };

  useEffect(() => {
    getZrc20Assets();
  }, []);

  useEffect(() => {
    if (!depositFees) {
      const getFees = async () => {
        let fees: any = await getBtcFees();
        //@ts-ignore next line
        setZetaDepositFees(fees?.zetaDepositFees);
        setDepositFees(fees?.zetaDepositFees + fees?.btcFees);
      };
      getFees();
      return () => {};
    }
  }, []);

  const CustomItemRenderer = ({ option }: any) => (
    <div className="dropdown-item">
      <div className="icon-symbol-wrapper">
        <img
          //@ts-ignore
          src={getChainIcon(+option.foreign_chain_id)}
          alt={option.symbol}
          className="dropdown-image"
        />
        <span>{option.symbol ?? 'Select Asset'}</span>
      </div>
    </div>
  );

  const maxFunds = satsToBtc(globalState?.utxo - depositFees);

  return (
    <SendWrapper>
      <FlexRowWrapper className="transfer-types-wrapper">
        <Typography
          onClick={() => setCurrentActive('zeta')}
          color={currentActive === 'zeta' ? '#fff' : '#b1cfc1'}
        >
          Deposit to ZetaChain
        </Typography>
        <Typography
          onClick={() => setCurrentActive('cctx')}
          color={currentActive === 'cctx' ? '#fff' : '#b1cfc1'}
        >
          Cross Chain
        </Typography>
      </FlexRowWrapper>
      {currentActive === 'cctx' && (
        <Select
          searchable={true}
          searchBy="symbol"
          options={ZRC20Assets}
          contentRenderer={(index) => (
            <div key={+index}>
              <CustomItemRenderer option={selectedZRC20} />
            </div>
          )}
          valueField="symbol"
          itemRenderer={({ item, itemIndex, methods }) => (
            <div key={itemIndex} onClick={() => methods.addItem(item)}>
              <CustomItemRenderer option={item} />
            </div>
          )}
          values={ZRC20Assets?.[1]?.symbol}
          onChange={(e) => setSelectedZRC20(e[0])}
          placeholder="Select an option"
        />
      )}

      <FlexColumnWrapper className="inputs-wrapper">
        <StyledInput
          placeholder="Recipent Address (Optional)"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setRecipientAddress(e.target.value)
          }
        />
        <StyledInput
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setAmount(e.target.value)
          }
          type="number"
          value={amount}
          min={0.00000001}
          placeholder="Amount"
        />
        <FlexRowWrapper
          className={`max-utxo ${maxFunds < 0 ? ' red' : ''}`}
          onClick={() => setAmount(maxFunds)}
        >
          Max: {isNaN(maxFunds) ? 0 : maxFunds} BTC
        </FlexRowWrapper>
        {currentActive === 'cctx' ? (
          <FlexRowWrapper className="custom-tooltip-wrapper">
            <StyledInput
              className="custom-memo-input"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCustomMemo(e.target.value)
              }
              type="string"
              placeholder="Custom Memo (Optional)"
            />
            <TooltipInfo placement="bottom">
              Custom memo is a string in following format ↓
              <Typography size={14}>
                Contract Address + Action Code + ZRC Contract Address +
                Destination Address
              </Typography>
              <a
                href="https://docs.zetalink.xyz/bridge-btc-to-zrc20-asset#custom-memo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Typography size={12}>
                  View more <RedirectIcon height={16} width={16} />
                </Typography>
              </a>
            </TooltipInfo>
          </FlexRowWrapper>
        ) : (
          <></>
        )}
      </FlexColumnWrapper>
      {maxFunds < 0 && (
        <InfoBox color="#ff4a3d">
          You don't have enough funds to proceed with this transaction
        </InfoBox>
      )}
      <InfoBox>
        {currentActive === 'zeta'
          ? 'Deposit BTC to ZetaChain either to specified recipent address, if recipent address is not mentioned the assets will be transferred to connected wallet address'
          : 'Cross chain transfer BTC to ZetaChain either to specified recipent address, if recipent address is not mentioned the assets will be transferred to connected wallet address'}
      </InfoBox>

      <FlexRowWrapper className="gas-wrapper">
        <GasIcon className="icon" /> Fees :
        <span className="amount">
          ~{isNaN(satsToBtc(depositFees)) ? 0 : satsToBtc(depositFees)} BTC
        </span>
      </FlexRowWrapper>
      <StyledButton
        disabled={
          currentActive === 'zeta'
            ? !amount
            : !amount || !selectedZRC20 || maxFunds < 0
        }
        onClick={sendTrx}
      >
        {isTrxProcessing ? 'Sending...' : 'Send'}
      </StyledButton>
    </SendWrapper>
  );
};

export default Send;
