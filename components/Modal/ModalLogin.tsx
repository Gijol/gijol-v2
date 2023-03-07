import { useDisclosure } from '@mantine/hooks';
import { Button, Group, Modal, PasswordInput, Space, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { LoginProps } from '../../lib/types';

export default function ModalLogin() {
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      id: '',
      password: '',
    },
  });
  const fetchCookies = async (loginInfo: LoginProps) => {
    const response = await fetch('http://localhost:3000/api/portalLogin', {
      method: 'POST',
      body: JSON.stringify(loginInfo),
    });
    return await response.json();
  };

  return (
    <>
      <Modal opened={opened} onClose={close} title="Authentication" centered withCloseButton>
        <form
          onSubmit={form.onSubmit((values: LoginProps) => {
            fetchCookies(values).then((response) => {
              console.log(response);
            });
          })}
        >
          <TextInput label="ID" placeholder="Your portal id" {...form.getInputProps('id')} />
          <Space h={20} />
          <PasswordInput
            label="Password"
            placeholder="Your portal password"
            {...form.getInputProps('password')}
          />
          <Button type="submit" mt="md">
            Submit
          </Button>
        </form>
      </Modal>
      <Group position="center">
        <Button onClick={open}>Portal Login</Button>
      </Group>
    </>
  );
}
