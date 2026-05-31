import React from 'react';
import { Container, Html, Head, Preview, Body, Section, Row, Column, Text } from '@react-email/components';

export type EmailShellProps = {
  previewText: string;
  children: React.ReactNode;
};

export function EmailShell({ previewText, children }: EmailShellProps) {
  return (
    <Html lang="vi">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={{ padding: '38px 16px 34px' }}>
            <Row>
              <Column align="center">
                <Section style={{ textAlign: 'center', paddingBottom: 28 }}>
                  <Row style={{ display: 'inline-flex' as any }}>
                    <Column style={{ width: 34 }}>
                      <div style={brandDot} />
                    </Column>
                    <Column style={{ paddingLeft: 10 }}>
                      <Text style={brandText}>UEIMS</Text>
                    </Column>
                  </Row>
                </Section>
              </Column>
            </Row>

            {children}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: '#FFFFFF',
  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
};

const container: React.CSSProperties = {
  width: '100%',
  maxWidth: 600,
};

const brandDot: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  backgroundColor: '#E67E22',
};

const brandText: React.CSSProperties = {
  margin: 0,
  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  fontSize: 22,
  lineHeight: '26px',
  fontWeight: 700,
  letterSpacing: '3px',
  color: '#E67E22',
};
