import {
  Heading,
  Table,
  Separator,
  Strong,
  TextField,
  Text,
  Button,
  Box,
  Flex,
  Dialog
} from "@radix-ui/themes";
import { CircularProgress } from "@mui/material";
import { useRef, useState } from "react";
import axios from "axios";

export default function () {
  const [isLoading, setIsLoading] = useState(true);
  const [idConexion, setIdConexion] = useState();
  const [error, setError] = useState(undefined);
  const dbHost = useRef(null);
  const dbPort = useRef(null);
  const dbPassword = useRef(null);
  const dbUser = useRef(null);
  const dbName = useRef(null);

  const handleRedirect = () => {
    window.location.href = `/db/${idConexion}/dashboard`;
  }

  const handleSubmit = async () => {

    const dbCredentials = {
      DBHOST: dbHost.current.value,
      DBPORT: dbPort.current.value,
      DBPASSWORD: dbPassword.current.value,
      DBUSER: dbUser.current.value,
      DBNAME: dbName.current.value
    };
    try {
      const infoConnection = await axios.post("/api/fastcrud/connection", dbCredentials);
      console.log(infoConnection.data);
      setIdConexion(infoConnection.data.idConexion);
      setError(undefined);
      setIsLoading(false);
    } catch (err) {
      setError(err.response.data.error);
    }
  }

  return (
    <>
      <Heading className="p-5" color="blue">
        Fast Crud API
      </Heading>
      <Separator my="3" size="4" />
      <Box className="mx-8">
        <Text>
          Proporcione las credenciales de su base de datos:
        </Text>
      </Box>
      <Table.Root variant="surface" className="mx-8 my-2">
        <Table.Body>
          <Table.Row>
            <Table.RowHeaderCell>
              <Strong>
                <Text color="blue">
                  DBHOST
                </Text>
              </Strong>
            </Table.RowHeaderCell>
            <Table.Cell>
              <TextField.Root
                ref={dbHost}
                size={3}
                placeholder="Introduce el host de la bd"
              />
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.RowHeaderCell>
              <Strong>
                <Text color="blue">
                  DBPORT
                </Text>
              </Strong>
            </Table.RowHeaderCell>
            <Table.Cell>
              <TextField.Root
                ref={dbPort}
                type="number"
                size={3}
                placeholder="Introduce el puerto de la bd"
              />
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.RowHeaderCell>
              <Strong>
                <Text color="blue">
                  DBPASSWORD
                </Text>
              </Strong>
            </Table.RowHeaderCell>
            <Table.Cell>
              <TextField.Root
                ref={dbPassword}
                type="password"
                size={3}
                placeholder="Introduce la password de la bd"
              />
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.RowHeaderCell>
              <Strong>
                <Text color="blue">
                  DBUSER
                </Text>
              </Strong>
            </Table.RowHeaderCell>
            <Table.Cell>
              <TextField.Root
                ref={dbUser}
                size={3}
                placeholder="Introduce el user de la bd"
              />
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.RowHeaderCell>
              <Strong>
                <Text color="blue">
                  DBNAME
                </Text>
              </Strong>
            </Table.RowHeaderCell>
            <Table.Cell>
              <TextField.Root
                ref={dbName}
                size={3}
                placeholder="Introduce el nombre de la bd"
              />
            </Table.Cell>
          </Table.Row>

        </Table.Body>
      </Table.Root>
      <Box className="mx-8">
        <Dialog.Root>
          <Dialog.Trigger>
            <Button className="my-5" onClick={handleSubmit}>
              Test conncection
            </Button>
          </Dialog.Trigger>

          {isLoading || error ? (
            <Dialog.Content maxWidth="450px">
              <Dialog.Title color={error ? ("red") : ""}>
                {error ? ("No se pudo conectar con bd") : "Probando Conexion"}
              </Dialog.Title>
              <Separator my="3" size="4" />
              <Dialog.Description size="2" mb="4">
                {error ? ("Ocurrio un error al momento de conectar con bd. Desglose del error: ") : "Espere un momento..."}
              </Dialog.Description>
              {error ? (
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      {Object.keys(error).map(item => (
                        <>
                          {item != "fatal" ? (
                            <Table.Cell>
                              {item}
                            </Table.Cell>
                          ) : null}
                        </>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      {Object.keys(error).map(item => (
                        <Table.Cell>
                          {error[item]}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              ) : (
                <div className="flex justify-center items-center">
                  <CircularProgress />
                </div>
              )}
              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button >
                    Cancel
                  </Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          ) : (
            <Dialog.Content maxWidth="450px">
              <Dialog.Title color="green">
                Conexion Exitosa
              </Dialog.Title>
              <Separator my="3" size="4" />
              <Dialog.Description size="2" mb="4">
                Se ha conectado correctamente a la base de datos.
              </Dialog.Description>
              <div className="flex justify-center items-center">
                Identificador de la conexion:
              </div>
              <div className="flex justify-center items-center">
                <Strong>
                  {idConexion}
                </Strong>
              </div>
              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button onClick={handleRedirect}>
                    Crear Crud
                  </Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          )}
        </Dialog.Root>
      </Box>
    </>
  )
}