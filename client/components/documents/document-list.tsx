"use client";
import { Row, Col } from 'antd';
import DocumentCard from './document-card';

export default function DocumentList({ docs, onOpenDoc }: { docs: any[], onOpenDoc: (doc: any) => void }) {
  return (
    <Row gutter={[24, 24]}>
      {docs.map((doc) => (
        <Col xs={24} sm={12} md={8} lg={6} key={doc.id}>
          <DocumentCard doc={doc} onOpen={onOpenDoc} />
        </Col>
      ))}
    </Row>
  );
}