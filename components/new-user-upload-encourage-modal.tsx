import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';

export default function NewUserUploadEncourageModal() {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <Modal opened={opened} onClose={close} title="Authentication" centered>
      {/* Modal content */}
    </Modal>
  );
}
