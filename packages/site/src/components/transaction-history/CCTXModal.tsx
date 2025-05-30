import Modal from 'react-modal';
import styled from 'styled-components/macro';

import CctxItem from './CctxItem';
import { ReactComponent as CrossIcon } from '../../assets/cross.svg';
import CctxFailure from '../../assets/failure-image.png';
import InfoBox from '../utils/InfoBox';
import Loader from '../utils/Loader';
import Typography from '../utils/Typography';

const CCTXModalWrapper = styled.div`
  position: relative;
`;

type CCTXModalProps = {
  cctx?: any;
  isCCTXModalOpen: boolean;
  setIsCCTXModalOpen: (isOpen: boolean) => void;
  cctxError?: string;
};

const customStyles = {
  content: {
    top: '50%',
    // maxWidth: '40%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#141417',
    padding: '16px',
    width: '400px',
    transition: '.5s all',
  },
};

const CCTXModal = ({
  cctx,
  isCCTXModalOpen,
  setIsCCTXModalOpen,
  cctxError,
}: CCTXModalProps): JSX.Element => {
  const handleCloseModal = () => {
    setIsCCTXModalOpen(false);
  };

  return (
    <CCTXModalWrapper>
      <Modal style={customStyles} isOpen={isCCTXModalOpen}>
        <CrossIcon
          onClick={handleCloseModal}
          style={{
            cursor: 'pointer',
            color: '#eeeeeecc',
            position: 'absolute',
            top: 20,
            height: '16px',
            width: '16px',
            right: 24,
          }}
        />

        {cctxError ? (
          <>
            <img
              className="failure-image"
              style={{
                width: '40%',
                margin: 'auto',
                justifyContent: 'center',
                display: 'flex',
              }}
              src={CctxFailure}
            />
            <Typography size={16}>{cctxError}</Typography>
            <br />
            {/* <Typography size={12} color="yellow"> */}
            <InfoBox color="red">
              Make sure that the Bitcoin transaction has 6+ confirmations
            </InfoBox>
            {/* </Typography> */}
          </>
        ) : (
          <>{!cctx?.index ? <Loader /> : <CctxItem cctx={cctx} />}</>
        )}
      </Modal>
    </CCTXModalWrapper>
  );
};

export default CCTXModal;
