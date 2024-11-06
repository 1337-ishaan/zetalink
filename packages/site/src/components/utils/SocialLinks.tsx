import styled from 'styled-components/macro';
import FlexRowWrapper from './wrappers/FlexRowWrapper';

import { ReactComponent as XLogo } from '../../assets/x.svg';
import { ReactComponent as DiscordLogo } from '../../assets/discord.svg';
import { ReactComponent as YoutubeLogo } from '../../assets/youtube.svg';
import { ReactComponent as GitbookLogo } from '../../assets/gitbook.svg';

const SocialLinksWrapper = styled(FlexRowWrapper)<{ isFloatingLeft?: boolean }>`
  column-gap: 24px;

  a.social {
    background: rgba(152, 152, 152, 0.5);

    align-items: center;
    display: flex;
    padding: 12px 12px;
    border-radius: ${(props) => props.theme.borderRadius};
    column-gap: 4px;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
      transform: scale(1.2);
      transition: all 0.3s;
      background: rgba(152, 152, 152, 1);
    }
    .social-logo {
      max-width: 32px;
      max-height: 32px;
    }
  }

  &.floating-left {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    flex-direction: column;
    width: fit-content;
    align-items: center;

    background: rgba(255, 255, 255, 0.2);
    z-index: 1;
    border-top-left-radius: ${(props) => props.theme.borderRadius};
    border-bottom-left-radius: ${(props) => props.theme.borderRadius};
    .social {
      background: transparent;
      &:hover {
        transform: unset;
      }
    }
  }
`;

interface SocialLinksProps {
  isFloatingLeft?: boolean;
}

const SocialLinks = ({
  isFloatingLeft = true,
}: SocialLinksProps): JSX.Element => {
  return (
    <SocialLinksWrapper className={isFloatingLeft ? 'floating-left' : ''}>
      <a
        className="social"
        rel="noopener noreferrer"
        href="https://www.youtube.com/watch?v=kpI7xZGap9I&list=PLABva2APwohYN5wiyL9qmv3MivbUvVfUb"
      >
        <YoutubeLogo className="social-logo" />
      </a>
      <a
        className="social"
        rel="noopener noreferrer"
        href="https://x.com/zetalinksnap"
      >
        <XLogo className="social-logo" />
      </a>
      <a
        className="social"
        rel="noopener noreferrer"
        href="https://discord.gg/q3Fn36qw5X"
      >
        <DiscordLogo className="social-logo" />
      </a>
      <a
        className="social"
        rel="noopener noreferrer"
        href="https://docs.zetalink.xyz"
      >
        <GitbookLogo className="social-logo" />
      </a>
    </SocialLinksWrapper>
  );
};

export default SocialLinks;
